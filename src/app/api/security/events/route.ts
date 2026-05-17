import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { internalServerError } from "@/lib/api-response";

const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? 50);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(Math.floor(limitParam), 1), MAX_LIMIT)
      : 50;
    const severity = request.nextUrl.searchParams.get("severity");

    const events = await db.auditLog.findMany({
      where: {
        userId: session.user.id,
        ...(severity ? { severity } : {}),
      },
      include: {
        repository: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      events: events.map((event) => ({
        id: event.id,
        event: event.event,
        severity: event.severity,
        message: event.message,
        metadata: event.metadata,
        createdAt: event.createdAt.toISOString(),
        repository: event.repository,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch security events:", error);
    return internalServerError("Failed to fetch security events");
  }
}
