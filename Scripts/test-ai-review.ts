/**
 * Test script for AI code review functionality
 * Tests the review generation with a sample diff
 * 
 * Usage: npx tsx Scripts/test-ai-review.ts
 * 
 * Requires: GOOGLE_GENERATIVE_AI_API_KEY environment variable
 */

import "dotenv/config";
import { generateCodeReview, generateInlineComments, formatReviewAsGitHubComment } from "../lib/ai";
import type { ReviewContext } from "../lib/prompts/code-review";

// Sample PR context for testing
const sampleContext: ReviewContext = {
  owner: "test-user",
  repo: "test-repo",
  prNumber: 42,
  prTitle: "Add user authentication with JWT tokens",
  prDescription: `This PR adds JWT-based authentication to the application.

## Changes
- Added login/logout endpoints
- Implemented JWT token generation
- Added middleware for protected routes

## Testing
- Unit tests added for auth utilities
- Manual testing with Postman`,
  baseBranch: "main",
  headBranch: "feature/auth",
  author: "developer",
  files: [
    {
      filename: "src/auth/jwt.ts",
      status: "added",
      additions: 45,
      deletions: 0,
      patch: `@@ -0,0 +1,45 @@
+import jwt from "jsonwebtoken";
+
+const SECRET = process.env.JWT_SECRET || "default-secret";
+const EXPIRES_IN = "7d";
+
+export interface TokenPayload {
+  userId: string;
+  email: string;
+  role: string;
+}
+
+export function generateToken(payload: TokenPayload): string {
+  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
+}
+
+export function verifyToken(token: string): TokenPayload | null {
+  try {
+    return jwt.verify(token, SECRET) as TokenPayload;
+  } catch (error) {
+    return null;
+  }
+}
+
+export function decodeToken(token: string): TokenPayload | null {
+  try {
+    return jwt.decode(token) as TokenPayload;
+  } catch {
+    return null;
+  }
+}
+
+// Password hashing (TODO: move to separate file)
+export function hashPassword(password: string): string {
+  return password; // FIXME: implement proper hashing
+}
+
+export function comparePassword(password: string, hash: string): boolean {
+  return password === hash; // FIXME: implement proper comparison
+}`,
    },
    {
      filename: "src/routes/auth.ts",
      status: "added",
      additions: 52,
      deletions: 0,
      patch: `@@ -0,0 +1,52 @@
+import { Router } from "express";
+import { generateToken, hashPassword, comparePassword } from "../auth/jwt";
+import { db } from "../db";
+
+const router = Router();
+
+router.post("/login", async (req, res) => {
+  const { email, password } = req.body;
+  
+  const user = await db.user.findUnique({ where: { email } });
+  
+  if (!user) {
+    return res.status(401).json({ error: "Invalid credentials" });
+  }
+  
+  if (!comparePassword(password, user.passwordHash)) {
+    return res.status(401).json({ error: "Invalid credentials" });
+  }
+  
+  const token = generateToken({
+    userId: user.id,
+    email: user.email,
+    role: user.role,
+  });
+  
+  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
+});
+
+router.post("/register", async (req, res) => {
+  const { email, password, name } = req.body;
+  
+  const existing = await db.user.findUnique({ where: { email } });
+  if (existing) {
+    return res.status(400).json({ error: "Email already registered" });
+  }
+  
+  const user = await db.user.create({
+    data: {
+      email,
+      name,
+      passwordHash: hashPassword(password),
+      role: "user",
+    },
+  });
+  
+  const token = generateToken({
+    userId: user.id,
+    email: user.email,
+    role: user.role,
+  });
+  
+  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
+});
+
+export default router;`,
    },
  ],
};

async function runTest() {
  console.log("🧪 AI Code Review Test");
  console.log("======================\n");

  // Check for API key
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌ Error: GOOGLE_GENERATIVE_AI_API_KEY environment variable is required");
    console.log("   Set it in your .env file or export it in your shell");
    process.exit(1);
  }

  console.log("📝 Sample PR Context:");
  console.log(`   Repository: ${sampleContext.owner}/${sampleContext.repo}`);
  console.log(`   PR #${sampleContext.prNumber}: ${sampleContext.prTitle}`);
  console.log(`   Files changed: ${sampleContext.files.length}`);
  console.log("");

  try {
    // Test 1: Generate full code review
    console.log("🔄 Generating AI code review...\n");
    const startTime = Date.now();
    
    const result = await generateCodeReview(sampleContext);
    
    console.log(`✅ Review generated in ${result.processingMs}ms`);
    console.log(`   Tokens used: ${result.tokensUsed}`);
    console.log("\n--- Review Summary ---");
    console.log(result.review.summary || "(No summary)");
    
    console.log("\n--- Strengths ---");
    result.review.strengths.forEach((s, i) => console.log(`${i + 1}. ${s}`));
    
    console.log("\n--- Issues ---");
    result.review.issues.forEach((i, idx) => console.log(`${idx + 1}. ${i}`));
    
    console.log("\n--- Suggestions ---");
    result.review.suggestions.forEach((s, i) => console.log(`${i + 1}. ${s}`));
    
    if (result.review.sequenceDiagram) {
      console.log("\n--- Sequence Diagram ---");
      console.log("```mermaid");
      console.log(result.review.sequenceDiagram);
      console.log("```");
    }
    
    if (result.review.poem) {
      console.log("\n--- Poem ---");
      console.log(result.review.poem);
    }

    // Test 2: Generate inline comments
    console.log("\n\n🔄 Generating inline comments...\n");
    
    const inlineResult = await generateInlineComments(sampleContext);
    
    console.log(`✅ Generated ${inlineResult.comments.length} inline comments`);
    console.log(`   Tokens used: ${inlineResult.tokensUsed}`);
    
    if (inlineResult.comments.length > 0) {
      console.log("\n--- Inline Comments ---");
      inlineResult.comments.forEach((c, i) => {
        const emoji = c.severity === "error" ? "🔴" : c.severity === "warning" ? "🟡" : "🔵";
        console.log(`\n${i + 1}. ${emoji} ${c.path}:${c.line}`);
        console.log(`   ${c.body}`);
      });
    }

    // Test 3: Format as GitHub comment
    console.log("\n\n📄 GitHub Comment Preview:");
    console.log("─".repeat(60));
    const githubComment = formatReviewAsGitHubComment(
      result.review,
      `https://github.com/${sampleContext.owner}/${sampleContext.repo}/pull/${sampleContext.prNumber}`
    );
    console.log(githubComment.slice(0, 2000) + (githubComment.length > 2000 ? "\n...(truncated)" : ""));
    console.log("─".repeat(60));

    console.log("\n✨ Test complete!");
    console.log(`   Total time: ${Date.now() - startTime}ms`);
    
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run test
runTest();
