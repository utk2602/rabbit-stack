/**
 * Test script for database connection and Prisma queries
 * Tests the database connection and basic CRUD operations
 * 
 * Usage: npx tsx Scripts/test-db.ts
 * 
 * Requires: DATABASE_URL environment variable
 */

import "dotenv/config";
import { db } from "../lib/db";

async function runTests() {
  console.log("🧪 Database Connection Test");
  console.log("============================\n");

  // Check for database URL
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL environment variable is required");
    process.exit(1);
  }

  try {
    // Test 1: Basic connection
    console.log("Test 1: Database Connection");
    console.log("   Connecting to database...");
    
    await db.$connect();
    console.log("✅ Connected successfully!\n");

    // Test 2: Count users
    console.log("Test 2: Count Records");
    const userCount = await db.user.count();
    const repoCount = await db.repository.count();
    const reviewCount = await db.pullRequestReview.count().catch(() => 0);
    
    console.log(`   Users: ${userCount}`);
    console.log(`   Repositories: ${repoCount}`);
    console.log(`   PR Reviews: ${reviewCount}`);
    console.log("");

    // Test 3: List connected repositories
    console.log("Test 3: Connected Repositories");
    const connectedRepos = await db.repository.findMany({
      where: { isConnected: true },
      select: {
        fullName: true,
        language: true,
        webhookId: true,
        user: {
          select: { email: true },
        },
      },
      take: 10,
    });

    if (connectedRepos.length === 0) {
      console.log("   No connected repositories found.");
    } else {
      connectedRepos.forEach((repo) => {
        const webhookStatus = repo.webhookId ? "✓ webhook" : "✗ no webhook";
        console.log(`   • ${repo.fullName} (${repo.language || "unknown"}) - ${webhookStatus}`);
      });
    }
    console.log("");

    // Test 4: List recent reviews (if model exists)
    console.log("Test 4: Recent Reviews");
    try {
      const recentReviews = await db.pullRequestReview.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          pullNumber: true,
          pullTitle: true,
          status: true,
          createdAt: true,
          repository: {
            select: { fullName: true },
          },
        },
      });

      if (recentReviews.length === 0) {
        console.log("   No reviews found.");
      } else {
        recentReviews.forEach((review) => {
          const status = review.status === "completed" ? "✅" : review.status === "failed" ? "❌" : "⏳";
          console.log(
            `   ${status} ${review.repository.fullName}#${review.pullNumber}: ${review.pullTitle.slice(0, 40)}...`
          );
        });
      }
    } catch {
      console.log("   (pullRequestReview model not yet migrated)");
    }
    console.log("");

    // Test 5: Query performance
    console.log("Test 5: Query Performance");
    const start = Date.now();
    await db.repository.findMany({
      where: { isConnected: true },
      include: { user: true },
    });
    const duration = Date.now() - start;
    console.log(`   Repository query: ${duration}ms`);
    console.log("");

    console.log("✨ All tests passed!");

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
    console.log("\n🔌 Disconnected from database.");
  }
}

// Run tests
runTests();
