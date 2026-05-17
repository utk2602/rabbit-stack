import { inngest } from "../client";
import { db } from "../../lib/db";
import {
  getGithubToken,
  getPullRequestDetails,
  getPullRequestFiles,
  getRepoTextFile,
  createPullRequestReview,
} from "../../module/github/github";
import {
  generateCodeReview,
  generateInlineComments,
  formatReviewAsGitHubComment,
  getSeverityEmoji,
} from "../../lib/ai";
import { pineconeIndex } from "../../lib/pinecone";
import { generateEmbedding } from "../../lib/embeddings";
import type { ReviewContext } from "../../lib/prompts/code-review";
import { decryptOptionalSecret } from "../../lib/secrets";
import { safeRecordAuditEvent } from "../../lib/audit";
import type { ReviewSeverity } from "../../lib/review-settings";

interface ReviewRequestEvent {
  name: "pull_request.review_requested";
  data: {
    owner: string;
    repo: string;
    pullNumber: number;
    repositoryId: string;
    userId: string;
    headSha: string;
    action: "opened" | "synchronize" | "reopened";
  };
}

const severityRank: Record<ReviewSeverity, number> = {
  info: 0,
  warning: 1,
  error: 2,
};

const REPOSITORY_RULE_PATHS = [
  ".rabbitstack.yml",
  ".rabbitstack.yaml",
  ".github/rabbitstack.yml",
  ".github/rabbitstack.yaml",
];

function shouldPostSeverity(
  severity: ReviewSeverity,
  minimumSeverity: string
) {
  const minimum =
    minimumSeverity in severityRank
      ? (minimumSeverity as ReviewSeverity)
      : "warning";

  return severityRank[severity] >= severityRank[minimum];
}

export const reviewPullRequest = inngest.createFunction(
  {
    id: "review-pull-request",
    retries: 2,
    concurrency: {
      limit: 5,
    },
  },
  { event: "pull_request.review_requested" },
  async ({ event, step }) => {
    const { owner, repo, pullNumber, repositoryId, userId, headSha, action } =
      event.data as ReviewRequestEvent["data"];

    console.log(
      `[Review] Starting review for ${owner}/${repo}#${pullNumber} (${action})`
    );

    // Check if we already have a review for this commit
    const existingReview = await step.run("check-existing", async () => {
      return await db.pullRequestReview.findFirst({
        where: {
          repositoryId,
          pullNumber,
          headSha,
          status: { in: ["completed", "in_progress"] },
        },
      });
    });

    if (existingReview) {
      console.log(
        `[Review] Review already exists for ${owner}/${repo}#${pullNumber}@${headSha.slice(0, 7)}`
      );
      return {
        success: true,
        skipped: true,
        reason: "Review already exists for this commit",
        reviewId: existingReview.id,
      };
    }

    // Get GitHub token
    const token = await step.run("get-token", async () => {
      return await getGithubToken(userId);
    });

    if (!token) {
      return { success: false, error: "No GitHub token found" };
    }

    // Fetch the user's OpenAI API key for embeddings
    const openaiApiKey = await step.run("get-openai-key", async () => {
      const settings = await db.settings.findUnique({
        where: { userId },
        select: { openaiApiKey: true },
      });
      return decryptOptionalSecret(settings?.openaiApiKey);
    });

    // Create pending review record
    const reviewRecord = await step.run("create-review-record", async () => {
      return await db.pullRequestReview.create({
        data: {
          repositoryId,
          pullNumber,
          headSha,
          pullTitle: "",
          pullUrl: "",
          baseBranch: "",
          headBranch: "",
          author: "",
          status: "in_progress",
        },
      });
    });

    const reviewSettings = await step.run("get-review-settings", async () => {
      return db.repositoryReviewSettings.findUnique({
        where: { repositoryId },
      });
    });

    const repositoryRules = await step.run("get-repository-rules", async () => {
      if (reviewSettings?.useRepositoryRules === false) {
        return null;
      }

      for (const path of REPOSITORY_RULE_PATHS) {
        const content = await getRepoTextFile(token, owner, repo, path);
        if (content?.trim()) {
          return `Rules from ${path}:\n${content.trim()}`;
        }
      }

      return null;
    });

    try {
      // Fetch PR details
      const prDetails = await step.run("fetch-pr-details", async () => {
        return await getPullRequestDetails(token, owner, repo, pullNumber);
      });

      // Update review with PR details
      await step.run("update-pr-details", async () => {
        await db.pullRequestReview.update({
          where: { id: reviewRecord.id },
          data: {
            pullTitle: prDetails.title,
            pullUrl: prDetails.htmlUrl,
            baseBranch: prDetails.baseRef,
            headBranch: prDetails.headRef,
            author: prDetails.author,
          },
        });
      });

      // Fetch PR files
      const files = await step.run("fetch-pr-files", async () => {
        return await getPullRequestFiles(token, owner, repo, pullNumber);
      });

      if (files.length === 0) {
        await step.run("mark-empty", async () => {
          await db.pullRequestReview.update({
            where: { id: reviewRecord.id },
            data: {
              status: "completed",
              summary: "No files changed in this pull request.",
            },
          });
        });
        return { success: true, reviewId: reviewRecord.id, message: "No files to review" };
      }

      // Get relevant codebase context from Pinecone (RAG)
      const relevantContext = await step.run("get-rag-context", async () => {
        try {
          // Create a query from the changed file paths and PR title
          const queryText = `${prDetails.title}\n${files.map((f) => f.filename).join("\n")}`;
          const queryEmbedding = await generateEmbedding(queryText, openaiApiKey ?? undefined);

          const results = await pineconeIndex
            .namespace(`${owner}/${repo}`)
            .query({
              vector: queryEmbedding,
              topK: 5,
              includeMetadata: true,
            });

          if (results.matches && results.matches.length > 0) {
            return results.matches
              .map((match) => {
                const meta = match.metadata as {
                  path?: string;
                  content?: string;
                  contentHash?: string;
                };
                if (meta.content) {
                  return `### ${meta.path}\n\`\`\`\n${meta.content}\n\`\`\``;
                }

                return `### ${meta.path}\nIndexed context matched. Snippet storage is disabled. Content hash: ${meta.contentHash ?? "unavailable"}`;
              })
              .join("\n\n");
          }
          return undefined;
        } catch (error) {
          console.error("[Review] RAG context fetch failed:", error);
          return undefined;
        }
      });

      // Build review context
      const reviewContext: ReviewContext = {
        owner,
        repo,
        prNumber: pullNumber,
        prTitle: prDetails.title,
        prDescription: prDetails.body || "",
        baseBranch: prDetails.baseRef,
        headBranch: prDetails.headRef,
        author: prDetails.author,
        files: files.map((f) => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          patch: f.patch,
        })),
        relevantContext: relevantContext ?? undefined,
        reviewMode: reviewSettings?.mode ?? "balanced",
        customRules: [reviewSettings?.customRules, repositoryRules]
          .filter(Boolean)
          .join("\n\n") || null,
      };

      // Generate AI review
      const reviewResult = await step.run("generate-review", async () => {
        return await generateCodeReview(reviewContext);
      });

      // Generate inline comments
      const inlineResult = await step.run("generate-inline-comments", async () => {
        return await generateInlineComments(reviewContext);
      });

      // Save review to database
      await step.run("save-review", async () => {
        await db.pullRequestReview.update({
          where: { id: reviewRecord.id },
          data: {
            status: "completed",
            summary: reviewResult.review.summary,
            walkthrough: reviewResult.review.walkthrough,
            strengths: reviewResult.review.strengths,
            issues: reviewResult.review.issues,
            suggestions: reviewResult.review.suggestions,
            poem: reviewResult.review.poem,
            diagram: reviewResult.review.sequenceDiagram,
            rawMarkdown: reviewResult.review.rawMarkdown,
            tokensUsed: reviewResult.tokensUsed + inlineResult.tokensUsed,
            processingMs: reviewResult.processingMs,
          },
        });

        // Save inline comments
        if (inlineResult.comments.length > 0) {
          await db.reviewComment.createMany({
            data: inlineResult.comments.map((c) => ({
              reviewId: reviewRecord.id,
              path: c.path,
              line: c.line,
              body: c.body,
              severity: c.severity,
            })),
          });
        }
      });

      // Post review to GitHub
      const githubResult = await step.run("post-to-github", async () => {
        const reviewBody = formatReviewAsGitHubComment(
          reviewResult.review,
          prDetails.htmlUrl
        );

        // Format inline comments with severity badges
        const githubComments = inlineResult.comments
          .filter((c) =>
            shouldPostSeverity(
              c.severity,
              reviewSettings?.minimumSeverityToPost ?? "warning"
            )
          )
          .map((c) => ({
            path: c.path,
            line: c.line,
            body: `${getSeverityEmoji(c.severity)} ${c.body}`,
          }));

        try {
          const result = await createPullRequestReview(
            token,
            owner,
            repo,
            pullNumber,
            reviewBody,
            githubComments,
            headSha
          );

          // Update review record with GitHub info
          await db.pullRequestReview.update({
            where: { id: reviewRecord.id },
            data: {
              postedToGithub: true,
              githubReviewId: result.reviewId,
            },
          });

          // Mark inline comments as posted
          await db.reviewComment.updateMany({
            where: { reviewId: reviewRecord.id },
            data: { postedToGithub: true },
          });

          return result;
        } catch (error) {
          console.error("[Review] Failed to post to GitHub:", error);
          throw error;
        }
      });

      console.log(
        `[Review] Completed review for ${owner}/${repo}#${pullNumber}: ${githubResult.htmlUrl}`
      );

      return {
        success: true,
        reviewId: reviewRecord.id,
        githubReviewId: githubResult.reviewId,
        githubUrl: githubResult.htmlUrl,
        tokensUsed: reviewResult.tokensUsed + inlineResult.tokensUsed,
        inlineComments: inlineResult.comments.length,
      };
    } catch (error) {
      // Mark review as failed
      await step.run("mark-failed", async () => {
        await db.pullRequestReview.update({
          where: { id: reviewRecord.id },
          data: {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });

        await safeRecordAuditEvent({
          event: "review.failed",
          userId,
          repositoryId,
          severity: "error",
          message: "AI pull request review failed",
          metadata: {
            owner,
            repo,
            pullNumber,
            headSha,
          },
        });
      });

      throw error;
    }
  }
);
