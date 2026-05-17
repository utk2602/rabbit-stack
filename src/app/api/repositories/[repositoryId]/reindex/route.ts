import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inngest } from "../../../../../../inngest/client";
import { safeRecordAuditEvent } from "@/lib/audit";
import { internalServerError } from "@/lib/api-response";
import { isSameOriginRequest } from "@/lib/request-origin";

interface RouteContext {
  params: Promise<{ repositoryId: string }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  if (!isSameOriginRequest(_request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { repositoryId } = await context.params;
    const repository = await db.repository.findFirst({
      where: {
        id: repositoryId,
        userId: session.user.id,
        isConnected: true,
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: "Connected repository not found" },
        { status: 404 }
      );
    }

    const [owner, repo] = repository.fullName.split("/");
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Repository full name is invalid" },
        { status: 400 }
      );
    }

    await db.repository.update({
      where: { id: repository.id },
      data: {
        indexingStatus: "queued",
        lastIndexError: null,
      },
    });

    await inngest.send({
      name: "repository.connected",
      data: {
        owner,
        repo,
        userId: session.user.id,
      },
    });

    await safeRecordAuditEvent({
      event: "repository.reindex_queued",
      userId: session.user.id,
      repositoryId: repository.id,
      severity: "info",
      message: "Repository indexing job queued manually",
      metadata: { fullName: repository.fullName },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to queue repository reindex:", error);
    return internalServerError("Failed to queue repository reindex");
  }
}
