import { NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import { headers } from "next/headers";
import { disconnectAllRepositories } from "../../../../../../module/github/github";

/**
 * DELETE /api/repositories/connected/all
 * Disconnects all connected repositories for the authenticated user
 */
export async function DELETE() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await disconnectAllRepositories(session.user.id);

    return NextResponse.json({
      success: true,
      disconnected: result.disconnected,
      errors: result.errors,
      message: `Successfully disconnected ${result.disconnected} repositories`,
    });
  } catch (error) {
    console.error("[API] Error disconnecting all repositories:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to disconnect repositories" 
      },
      { status: 500 }
    );
  }
}
