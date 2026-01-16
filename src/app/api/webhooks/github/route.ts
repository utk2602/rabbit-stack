import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "../../../../../lib/db";

type WebhookEvent =
  | "push"
  | "pull_request"
  | "pull_request_review"
  | "pull_request_review_comment"
  | "issue_comment"
  | "commit_comment"
  | "ping";

interface WebhookPayload {
  action?: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  sender: {
    login: string;
    id: number;
  };
  ref?: string;
  commits?: Array<{
    id: string;
    message: string;
    author: { name: string; email: string };
  }>;
  pull_request?: {
    id: number;
    number: number;
    title: string;
    state: string;
    html_url: string;
    head: { sha: string; ref: string };
    base: { sha: string; ref: string };
  };
  review?: {
    id: number;
    state: string;
    body: string;
    html_url: string;
  };
  comment?: {
    id: number;
    body: string;
    html_url: string;
  };
}

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = `sha256=${hmac.update(payload).digest("hex")}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function handlePushEvent(payload: WebhookPayload, repositoryId: string) {
  const commits = payload.commits || [];
  console.log(
    `[Webhook] Push event: ${commits.length} commits to ${payload.repository.full_name}`
  );

  for (const commit of commits) {
    console.log(`  - Commit ${commit.id.slice(0, 7)}: ${commit.message}`);
  }

  
}


async function handlePullRequestEvent(
  payload: WebhookPayload,
  repositoryId: string
) {
  const pr = payload.pull_request;
  if (!pr) return;

  console.log(
    `[Webhook] PR event: ${payload.action} - #${pr.number} "${pr.title}" on ${payload.repository.full_name}`
  );
  switch (payload.action) {
    case "opened":
    case "synchronize":
      console.log(`  → Ready for code review`);
      break;

    case "closed":
      if (pr.state === "merged") {
        console.log(`  → PR merged`);
      } else {
        console.log(`  → PR closed without merge`);
      }
      break;

    case "reopened":
      console.log(`  → PR reopened`);
      break;
  }
}


async function handlePullRequestReviewEvent(
  payload: WebhookPayload,
  repositoryId: string
) {
  const review = payload.review;
  const pr = payload.pull_request;
  if (!review || !pr) return;

  console.log(
    `[Webhook] Review event: ${payload.action} - ${review.state} on PR #${pr.number}`
  );

  
}

async function handleReviewCommentEvent(
  payload: WebhookPayload,
  repositoryId: string
) {
  const comment = payload.comment;
  const pr = payload.pull_request;
  if (!comment || !pr) return;

  console.log(
    `[Webhook] Review comment on PR #${pr.number}: ${comment.body.slice(0, 50)}...`
  );
}


async function handlePingEvent(payload: WebhookPayload) {
  console.log(
    `[Webhook] Ping received for ${payload.repository.full_name} - Webhook is active!`
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody) as WebhookPayload;
    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event") as WebhookEvent;
    const deliveryId = request.headers.get("x-github-delivery");

    console.log(`[Webhook] Received ${event} event (delivery: ${deliveryId})`);

    const repository = await db.repository.findFirst({
      where: {
        githubId: payload.repository.id,
        isConnected: true,
      },
    });

    if (!repository) {
      console.log(
        `[Webhook] Repository ${payload.repository.full_name} not found or not connected`
      );
      return NextResponse.json(
        { error: "Repository not found or not connected" },
        { status: 404 }
      );
    }

    if (repository.webhookSecret) {
      const isValid = verifyWebhookSignature(
        rawBody,
        signature,
        repository.webhookSecret
      );

      if (!isValid) {
        console.error("[Webhook] Invalid signature");
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    switch (event) {
      case "ping":
        await handlePingEvent(payload);
        break;

      case "push":
        await handlePushEvent(payload, repository.id);
        break;

      case "pull_request":
        await handlePullRequestEvent(payload, repository.id);
        break;

      case "pull_request_review":
        await handlePullRequestReviewEvent(payload, repository.id);
        break;

      case "pull_request_review_comment":
        await handleReviewCommentEvent(payload, repository.id);
        break;

      case "issue_comment":
        console.log(`[Webhook] Issue comment on ${payload.repository.full_name}`);
        break;

      case "commit_comment":
        console.log(`[Webhook] Commit comment on ${payload.repository.full_name}`);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event}`);
    }

    return NextResponse.json({ 
      success: true, 
      event,
      repository: payload.repository.full_name 
    });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "GitHub webhook endpoint is active" 
  });
}
