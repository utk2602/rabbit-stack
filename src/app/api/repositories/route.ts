import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { headers } from "next/headers";
import { syncUserRepositories, toggleRepositoryConnection } from "../../../../module/github/github";
import { inngest } from "../../../../inngest/client";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const data = await syncUserRepositories(session.user.id, cursor, limit);

    if (!data) {
      return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { githubId, repoData } = body;

    if (!githubId) {
      return NextResponse.json({ error: "githubId is required" }, { status: 400 });
    }

    const result = await toggleRepositoryConnection(
      session.user.id,
      githubId,
      repoData
    );

    if (result.isConnected && repoData?.fullName) {
      const [owner, repo] = repoData.fullName.split("/");
      await inngest.send({
        name: "repository.connected",
        data: {
          owner,
          repo,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({
      isConnected: result.isConnected,
      webhookCreated: result.webhookCreated,
      error: result.error,
    });
  } catch (error) {
    console.error("Error toggling repository connection:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to toggle connection" },
      { status: 500 }
    );
  }
}
