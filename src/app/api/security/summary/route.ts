import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../../lib/auth";
import { getSecuritySummary } from "../../../../../lib/security-summary";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await getSecuritySummary(session.user.id);

  return NextResponse.json(summary);
}
