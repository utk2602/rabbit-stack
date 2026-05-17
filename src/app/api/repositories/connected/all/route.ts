import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import { headers } from "next/headers";
import { disconnectAllRepositories } from "../../../../../../module/github/github";
import { internalServerError } from "../../../../../../lib/api-response";
import { isSameOriginRequest } from "../../../../../../lib/request-origin";
import { checkRateLimit, rateLimitKey } from "../../../../../../lib/rate-limit";

/**
 * DELETE /api/repositories/connected/all
 * Disconnects all connected repositories for the authenticated user
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rateLimit = checkRateLimit({
      key: rateLimitKey("repositories:disconnect_all", session.user.id),
      limit: 3,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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
    return internalServerError("Failed to disconnect repositories");
  }
}
