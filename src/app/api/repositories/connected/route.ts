import { NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { headers } from "next/headers";
import { db } from "../../../../../lib/db";
import { internalServerError } from "../../../../../lib/api-response";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const connectedRepos = await db.repository.findMany({
      where: {
        userId: session.user.id,
        isConnected: true,
      },
      select: {
        id: true,
        githubId: true,
        name: true,
        fullName: true,
        language: true,
        isPrivate: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      count: connectedRepos.length,
      repositories: connectedRepos,
    });
  } catch (error) {
    console.error("Error fetching connected repositories:", error);
    return internalServerError("Failed to fetch connected repositories");
  }
}
