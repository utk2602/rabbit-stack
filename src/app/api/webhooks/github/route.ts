import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "../../../../../lib/db";
import { inngest } from "../../../../../inngest/client";
import { decryptOptionalSecret } from "../../../../../lib/secrets";
import { safeRecordAuditEvent } from "../../../../../lib/audit";
import { internalServerError } from "../../../../../lib/api-response";

type WebhookEvent =
  | "push"
  | "pull_request"
  | "pull_request_review"
  | "pull_request_review_comment"
  | "issue_comment"
  | "commit_comment"
  | "ping";

const SUPPORTED_WEBHOOK_EVENTS = new Set<string>([
  "push",
  "pull_request",
  "pull_request_review",
  "pull_request_review_comment",
  "issue_comment",
  "commit_comment",
  "ping",
]);

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

function isWebhookEvent(event: string | null): event is WebhookEvent {
  return event !== null && SUPPORTED_WEBHOOK_EVENTS.has(event);
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
  repositoryId: string,
  userId: string
) {
  const pr = payload.pull_request;
  if (!pr) return;

  const [owner, repo] = payload.repository.full_name.split("/");

  console.log(
    `[Webhook] PR event: ${payload.action} - #${pr.number} "${pr.title}" on ${payload.repository.full_name}`
  );
  switch (payload.action) {
    case "opened":
    case "synchronize":
    case "reopened":
      console.log(`  → Triggering AI code review...`);
      
      // Trigger the AI code review via Inngest
      await inngest.send({
        name: "pull_request.review_requested",
        data: {
          owner,
          repo,
          pullNumber: pr.number,
          repositoryId,
          userId,
          headSha: pr.head.sha,
          action: payload.action as "opened" | "synchronize" | "reopened",
        },
      });
      
      console.log(`  → Code review job queued for PR #${pr.number}`);
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

async function updateWebhookHealth(
  repositoryId: string,
  data: {
    deliveryId: string | null;
    event: string;
    status: "valid" | "invalid" | "error";
    error?: string | null;
  }
) {
  await db.repository.update({
    where: { id: repositoryId },
    data: {
      lastWebhookDeliveryId: data.deliveryId,
      lastWebhookEvent: data.event,
      lastWebhookStatus: data.status,
      lastWebhookError: data.error ?? null,
      lastWebhookAt: new Date(),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let parsedPayload: Partial<WebhookPayload>;

    try {
      parsedPayload = JSON.parse(rawBody) as Partial<WebhookPayload>;
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const signature = request.headers.get("x-hub-signature-256");
    const eventHeader = request.headers.get("x-github-event");
    const deliveryId = request.headers.get("x-github-delivery");

    if (!isWebhookEvent(eventHeader)) {
      return NextResponse.json(
        { error: "Unsupported webhook event" },
        { status: 400 }
      );
    }

    if (!parsedPayload.repository?.id || !parsedPayload.repository.full_name) {
      return NextResponse.json(
        { error: "Invalid webhook repository payload" },
        { status: 400 }
      );
    }

    const payload = parsedPayload as WebhookPayload;
    const event = eventHeader;

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

    const webhookSecret = decryptOptionalSecret(repository.webhookSecret);

    if (!webhookSecret) {
      console.error("[Webhook] Connected repository has no webhook secret");
      await updateWebhookHealth(repository.id, {
        deliveryId,
        event,
        status: "invalid",
        error: "Missing webhook secret",
      });
      await safeRecordAuditEvent({
        event: "webhook.secret.missing",
        userId: repository.userId,
        repositoryId: repository.id,
        severity: "error",
        message: "Connected repository received a webhook without a stored secret",
        metadata: { deliveryId, event },
      });
      return NextResponse.json(
        { error: "Webhook signature verification is not configured" },
        { status: 401 }
      );
    }

    const isValid = verifyWebhookSignature(
      rawBody,
      signature,
      webhookSecret
    );

    if (!isValid) {
      console.error("[Webhook] Invalid signature");
      await updateWebhookHealth(repository.id, {
        deliveryId,
        event,
        status: "invalid",
        error: "Invalid webhook signature",
      });
      await safeRecordAuditEvent({
        event: "webhook.signature.invalid",
        userId: repository.userId,
        repositoryId: repository.id,
        severity: "error",
        message: "GitHub webhook signature verification failed",
        metadata: { deliveryId, event },
      });
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    switch (event) {
      case "ping":
        await handlePingEvent(payload);
        break;

      case "push":
        await handlePushEvent(payload, repository.id);
        break;

      case "pull_request":
        await handlePullRequestEvent(payload, repository.id, repository.userId);
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

    await updateWebhookHealth(repository.id, {
      deliveryId,
      event,
      status: "valid",
    });

    return NextResponse.json({ 
      success: true, 
      event,
      repository: payload.repository.full_name 
    });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return internalServerError("Webhook processing failed");
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "GitHub webhook endpoint is active" 
  });
}
