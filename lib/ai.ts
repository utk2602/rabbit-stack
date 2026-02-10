/**
 * AI Client for Code Reviews
 * Uses Vercel AI SDK with Google's Gemini model
 */

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import {
  CODE_REVIEW_SYSTEM_PROMPT,
  INLINE_COMMENTS_SYSTEM_PROMPT,
  generateCodeReviewPrompt,
  generateInlineCommentsPrompt,
  parseReviewResponse,
  type ReviewContext,
  type ParsedReviewResponse,
  type InlineComment,
} from "./prompts/code-review";

// Gemini 1.5 Pro for comprehensive code reviews
const reviewModel = google("gemini-1.5-pro");

// Gemini 1.5 Flash for faster inline comments
const inlineModel = google("gemini-1.5-flash");

export interface CodeReviewResult {
  review: ParsedReviewResponse;
  tokensUsed: number;
  processingMs: number;
}

export interface InlineCommentsResult {
  comments: InlineComment[];
  tokensUsed: number;
}

/**
 * Generate a comprehensive code review for a pull request
 */
export async function generateCodeReview(
  context: ReviewContext
): Promise<CodeReviewResult> {
  const startTime = Date.now();

  const prompt = generateCodeReviewPrompt(context);

  const { text, usage } = await generateText({
    model: reviewModel,
    system: CODE_REVIEW_SYSTEM_PROMPT,
    prompt,
    temperature: 0.3,
  });

  const review = parseReviewResponse(text);
  const processingMs = Date.now() - startTime;

  return {
    review,
    tokensUsed: usage?.totalTokens ?? 0,
    processingMs,
  };
}

/**
 * Generate inline comments for specific code issues
 */
export async function generateInlineComments(
  context: ReviewContext
): Promise<InlineCommentsResult> {
  const prompt = generateInlineCommentsPrompt(context);

  const { text, usage } = await generateText({
    model: inlineModel,
    system: INLINE_COMMENTS_SYSTEM_PROMPT,
    prompt,
    temperature: 0.2,
  });

  let comments: InlineComment[] = [];

  try {
    // Extract JSON from the response (in case there's extra text)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        comments = parsed.filter(
          (c): c is InlineComment =>
            typeof c.path === "string" &&
            typeof c.line === "number" &&
            typeof c.body === "string" &&
            ["info", "warning", "error"].includes(c.severity)
        );
      }
    }
  } catch (error) {
    console.error("Failed to parse inline comments:", error);
    console.error("Raw response:", text);
  }

  return {
    comments,
    tokensUsed: usage?.totalTokens ?? 0,
  };
}

/**
 * Format the review as a GitHub PR comment
 */
export function formatReviewAsGitHubComment(
  review: ParsedReviewResponse,
  prUrl: string
): string {
  let comment = `## 🐰 Rabbit Stack AI Review\n\n`;

  if (review.summary) {
    comment += `### Summary\n${review.summary}\n\n`;
  }

  if (review.walkthrough) {
    comment += `### Walkthrough\n${review.walkthrough}\n\n`;
  }

  if (review.sequenceDiagram) {
    comment += `### Sequence Diagram\n\`\`\`mermaid\n${review.sequenceDiagram}\n\`\`\`\n\n`;
  }

  if (review.strengths.length > 0) {
    comment += `### ✅ Strengths\n`;
    comment += review.strengths.map((s) => `- ${s}`).join("\n");
    comment += "\n\n";
  }

  if (review.issues.length > 0) {
    comment += `### ⚠️ Issues\n`;
    comment += review.issues.map((i) => `- ${i}`).join("\n");
    comment += "\n\n";
  }

  if (review.suggestions.length > 0) {
    comment += `### 💡 Suggestions\n`;
    comment += review.suggestions.map((s) => `- ${s}`).join("\n");
    comment += "\n\n";
  }

  if (review.poem) {
    comment += `### 📜 Poem\n${review.poem}\n\n`;
  }

  comment += `---\n*Powered by [Rabbit Stack](${prUrl}) - AI Code Review*`;

  return comment;
}

/**
 * Format severity badge for inline comments
 */
export function getSeverityEmoji(severity: "info" | "warning" | "error"): string {
  switch (severity) {
    case "error":
      return "🔴";
    case "warning":
      return "🟡";
    case "info":
      return "🔵";
  }
}
