/**
 * Test script for webhook endpoint
 * Simulates GitHub webhook payloads to test the webhook handler
 * 
 * Usage: npx tsx Scripts/test-webhook.ts
 */

import crypto from "crypto";

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || "http://localhost:3000";
const WEBHOOK_SECRET = process.env.TEST_WEBHOOK_SECRET || "test-secret";

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
  pull_request?: {
    id: number;
    number: number;
    title: string;
    state: string;
    html_url: string;
    head: { sha: string; ref: string };
    base: { sha: string; ref: string };
  };
}

function generateSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  return `sha256=${hmac.update(payload).digest("hex")}`;
}

async function sendWebhook(
  event: string,
  payload: WebhookPayload,
  secret?: string
): Promise<void> {
  const body = JSON.stringify(payload);
  const signature = secret ? generateSignature(body, secret) : undefined;

  console.log(`\n📤 Sending ${event} webhook...`);
  console.log(`   URL: ${WEBHOOK_URL}/api/webhooks/github`);

  try {
    const response = await fetch(`${WEBHOOK_URL}/api/webhooks/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Event": event,
        "X-GitHub-Delivery": crypto.randomUUID(),
        ...(signature && { "X-Hub-Signature-256": signature }),
      },
      body,
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success (${response.status}):`, data);
    } else {
      console.log(`❌ Error (${response.status}):`, data);
    }
  } catch (error) {
    console.error(`❌ Request failed:`, error);
  }
}

async function runTests() {
  console.log("🧪 Webhook Test Suite");
  console.log("=====================\n");

  // Test 1: Ping event
  console.log("Test 1: Ping Event");
  await sendWebhook("ping", {
    repository: {
      id: 123456,
      name: "test-repo",
      full_name: "test-user/test-repo",
    },
    sender: {
      login: "test-user",
      id: 1,
    },
  });

  // Test 2: Pull request opened (without secret - should work for unconfigured repos)
  console.log("\nTest 2: Pull Request Opened");
  await sendWebhook("pull_request", {
    action: "opened",
    repository: {
      id: 123456,
      name: "test-repo",
      full_name: "test-user/test-repo",
    },
    sender: {
      login: "test-user",
      id: 1,
    },
    pull_request: {
      id: 1,
      number: 42,
      title: "Add new feature",
      state: "open",
      html_url: "https://github.com/test-user/test-repo/pull/42",
      head: { sha: "abc123", ref: "feature-branch" },
      base: { sha: "def456", ref: "main" },
    },
  });

  // Test 3: Pull request with signature
  console.log("\nTest 3: Pull Request with Signature");
  await sendWebhook(
    "pull_request",
    {
      action: "synchronize",
      repository: {
        id: 123456,
        name: "test-repo",
        full_name: "test-user/test-repo",
      },
      sender: {
        login: "test-user",
        id: 1,
      },
      pull_request: {
        id: 1,
        number: 42,
        title: "Add new feature",
        state: "open",
        html_url: "https://github.com/test-user/test-repo/pull/42",
        head: { sha: "xyz789", ref: "feature-branch" },
        base: { sha: "def456", ref: "main" },
      },
    },
    WEBHOOK_SECRET
  );

  console.log("\n✨ Tests complete!");
}

// Run tests
runTests().catch(console.error);
