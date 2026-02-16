import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../../../lib/db";

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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { apiKey } = await request.json();

  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-")) {
    return NextResponse.json(
      { error: "Invalid API key. It should start with 'sk-'" },
      { status: 400 }
    );
  }

  await db.settings.upsert({
    where: { userId: session.user.id },
    update: { openaiApiKey: apiKey },
    create: { userId: session.user.id, openaiApiKey: apiKey },
  });

  return NextResponse.json({ success: true });
}
