import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function hasValidEncryptionKey() {
  const key = process.env.DATA_ENCRYPTION_KEY;
  if (!key) return false;

  try {
    return Buffer.from(key, "base64").length === 32;
  } catch {
    return false;
  }
}

export async function GET() {
  const checks = {
    app: true,
    database: false,
    encryptionKey: hasValidEncryptionKey(),
  };

  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error("Health database check failed:", error);
  }

  const healthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
