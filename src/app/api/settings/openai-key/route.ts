import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../../../lib/db";
import { encryptSecret } from "../../../../../lib/secrets";
import { safeRecordAuditEvent } from "../../../../../lib/audit";
import { isSameOriginRequest } from "../../../../../lib/request-origin";
import { checkRateLimit, rateLimitKey } from "../../../../../lib/rate-limit";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.settings.findUnique({
    where: { userId: session.user.id },
    select: { openaiApiKey: true },
  });

  return NextResponse.json({ hasKey: !!settings?.openaiApiKey });
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit({
    key: rateLimitKey("settings:openai-key", session.user.id),
    limit: 5,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { apiKey } = await request.json();

  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-")) {
    return NextResponse.json(
      { error: "Invalid API key. It should start with 'sk-'" },
      { status: 400 }
    );
  }

  const encryptedApiKey = encryptSecret(apiKey);

  await db.settings.upsert({
    where: { userId: session.user.id },
    update: { openaiApiKey: encryptedApiKey },
    create: { userId: session.user.id, openaiApiKey: encryptedApiKey },
  });

  await safeRecordAuditEvent({
    event: "settings.openai_key.updated",
    userId: session.user.id,
    message: "OpenAI API key was updated",
  });

  return NextResponse.json({ success: true });
}
