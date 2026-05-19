import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasValidSecretEncryptionKey } from "@/lib/security-env";

export async function GET() {
  const checks = {
    app: true,
    database: false,
    encryptionKey: hasValidSecretEncryptionKey(),
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
