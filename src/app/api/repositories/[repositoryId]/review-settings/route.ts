import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getRepositoryReviewSettings,
  updateRepositoryReviewSettings,
} from "@/lib/review-settings";

interface RouteContext {
  params: Promise<{ repositoryId: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repositoryId } = await context.params;
  const settings = await getRepositoryReviewSettings(
    repositoryId,
    session.user.id
  );

  if (!settings) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repositoryId } = await context.params;
  const body = await request.json();
  const settings = await updateRepositoryReviewSettings(
    repositoryId,
    session.user.id,
    body
  );

  if (!settings) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  return NextResponse.json({ settings });
}
