import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getRepositoryReviewSettings,
  updateRepositoryReviewSettings,
} from "@/lib/review-settings";
import { safeRecordAuditEvent } from "@/lib/audit";
import { isSameOriginRequest } from "@/lib/request-origin";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

interface RouteContext {
  params: Promise<{ repositoryId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: rateLimitKey("review-settings:update", session.user.id),
    limit: 30,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { repositoryId } = await context.params;
  const settings = await getRepositoryReviewSettings(
    repositoryId,
    session.user.id
  );

  if (!settings) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  await safeRecordAuditEvent({
    event: "review_settings.updated",
    userId: session.user.id,
    repositoryId,
    severity: "info",
    message: "Repository review settings updated",
    metadata: {
      mode: settings.mode,
      minimumSeverityToPost: settings.minimumSeverityToPost,
      useRepositoryRules: settings.useRepositoryRules,
      hasCustomRules: Boolean(settings.customRules),
    },
  });

  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repositoryId } = await context.params;
  const body = await request.json();
  let settings;

  try {
    settings = await updateRepositoryReviewSettings(
      repositoryId,
      session.user.id,
      body
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid review settings" },
      { status: 400 }
    );
  }

  if (!settings) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  return NextResponse.json({ settings });
}
