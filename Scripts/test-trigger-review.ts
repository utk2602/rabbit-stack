/**
 * Test script for triggering a code review via Inngest
 * Manually triggers the review process for a connected repository
 * 
 * Usage: npx tsx Scripts/test-trigger-review.ts <owner> <repo> <pr-number>
 * 
 * Example: npx tsx Scripts/test-trigger-review.ts myuser myrepo 1
 */

import "dotenv/config";
import { db } from "../lib/db";
import { inngest } from "../inngest/client";

async function runTest() {
  console.log("🧪 Trigger Code Review Test");
  console.log("============================\n");

  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log("Usage: npx tsx Scripts/test-trigger-review.ts <owner> <repo> <pr-number>");
    console.log("Example: npx tsx Scripts/test-trigger-review.ts myuser myrepo 1");
    process.exit(1);
  }

  const [owner, repoName, prNumberStr] = args;
  const prNumber = parseInt(prNumberStr, 10);
  const fullName = `${owner}/${repoName}`;

  if (isNaN(prNumber)) {
    console.error("❌ Error: PR number must be a valid integer");
    process.exit(1);
  }

  console.log(`📝 Looking for repository: ${fullName}`);

  try {
    // Find the repository
    const repository = await db.repository.findFirst({
      where: {
        fullName: fullName,
        isConnected: true,
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!repository) {
      console.error(`❌ Error: Repository "${fullName}" not found or not connected`);
      console.log("\nConnected repositories:");
      const connected = await db.repository.findMany({
        where: { isConnected: true },
        select: { fullName: true },
        take: 10,
      });
      connected.forEach((r) => console.log(`   • ${r.fullName}`));
      process.exit(1);
    }

    console.log(`✅ Found repository: ${repository.fullName}`);
    console.log(`   Owner: ${repository.user.email}`);
    console.log(`   Repository ID: ${repository.id}`);
    console.log("");

    // Trigger the review
    console.log(`🔄 Triggering code review for PR #${prNumber}...`);
    
    const eventId = await inngest.send({
      name: "pull_request.review_requested",
      data: {
        owner,
        repo: repoName,
        pullNumber: prNumber,
        repositoryId: repository.id,
        userId: repository.user.id,
        headSha: `test-${Date.now()}`, // Fake SHA for testing
        action: "opened" as const,
      },
    });

    console.log(`✅ Event sent successfully!`);
    console.log(`   Event ID: ${JSON.stringify(eventId)}`);
    console.log("");
    console.log("📊 Check your Inngest dashboard to monitor the function execution:");
    console.log("   https://app.inngest.com/");
    console.log("");
    console.log("✨ Test complete!");

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run test
runTest();
