import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inngest } from "../../../../../../inngest/client";
import { safeRecordAuditEvent } from "@/lib/audit";
import { internalServerError } from "@/lib/api-response";
import { isSameOriginRequest } from "@/lib/request-origin";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

interface RouteContext {
  params: Promise<{ reviewId: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: rateLimitKey("reviews:retry", session.user.id),
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { reviewId } = await context.params;
    const review = await db.pullRequestReview.findFirst({
      where: {
        id: reviewId,
        repository: { userId: session.user.id },
      },
      include: {
        repository: {
          select: {
            id: true,
            fullName: true,
            isConnected: true,
          },
        },
      },
    });

    if (!review || !review.repository.isConnected) {
      return NextResponse.json(
        { error: "Connected review repository not found" },
        { status: 404 }
      );
    }

    const [owner, repo] = review.repository.fullName.split("/");
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Repository full name is invalid" },
        { status: 400 }
      );
    }

    await db.pullRequestReview.update({
      where: { id: review.id },
      data: {
        status: "pending",
        error: null,
      },
    });

    await inngest.send({
      name: "pull_request.review_requested",
      data: {
        owner,
        repo,
        pullNumber: review.pullNumber,
        repositoryId: review.repository.id,
        userId: session.user.id,
        headSha: review.headSha,
        action: "synchronize",
      },
    });

    await safeRecordAuditEvent({
      event: "review.retry_queued",
      userId: session.user.id,
      repositoryId: review.repository.id,
      severity: "info",
      message: "Pull request review retry queued",
      metadata: {
        reviewId: review.id,
        pullNumber: review.pullNumber,
        headSha: review.headSha,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to queue review retry:", error);
    return internalServerError("Failed to queue review retry");
  }
}
