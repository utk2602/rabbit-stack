import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "../../../../../lib/auth";
import {
  getLatestDependencyAudit,
  recordNpmAudit,
} from "../../../../../lib/dependency-audit";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ audit: await getLatestDependencyAudit() });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const audit = await recordNpmAudit(payload);

  return NextResponse.json({
    id: audit.id,
    total: audit.total,
    critical: audit.critical,
    high: audit.high,
    moderate: audit.moderate,
    low: audit.low,
    info: audit.info,
    fixable: audit.fixable,
  });
}
