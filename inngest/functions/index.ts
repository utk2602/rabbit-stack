import { inngest } from "../client";
import { db } from "../../lib/db";
import crypto from "crypto";
import { getGithubToken, getRepoFileContent } from "../../module/github/github";
import { chunkCode, generateEmbeddings, prepareCodeForEmbedding } from "../../lib/embeddings";
import { pineconeIndex } from "../../lib/pinecone";
import { decryptOptionalSecret } from "../../lib/secrets";

// Re-export the PR review function
export { reviewPullRequest } from "./reviewPullRequest";

function shouldStoreCodeSnippets() {
  return process.env.PINECONE_STORE_CODE_SNIPPETS === "true";
}

function hashChunkContent(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    if (!owner || !repo || !userId) {
      return { success: false, error: `Missing required data: owner=${owner}, repo=${repo}, userId=${userId}` };
    }

    const repository = await step.run("find-repository", async () => {
      return db.repository.findFirst({
        where: {
          userId,
          fullName: `${owner}/${repo}`,
        },
        select: { id: true },
      });
    });

    if (!repository) {
      return { success: false, error: `Repository not found: ${owner}/${repo}` };
    }

    await step.run("mark-indexing-started", async () => {
      await db.repository.update({
        where: { id: repository.id },
        data: {
          indexingStatus: "indexing",
          lastIndexError: null,
        },
      });
    });

    // Fetch the user's OpenAI API key from settings
    const openaiApiKey = await step.run("get-openai-key", async () => {
      const settings = await db.settings.findUnique({
        where: { userId },
        select: { openaiApiKey: true },
      });
      return decryptOptionalSecret(settings?.openaiApiKey);
    });

    if (!openaiApiKey) {
      await step.run("mark-missing-openai-key", async () => {
        await db.repository.update({
          where: { id: repository.id },
          data: {
            indexingStatus: "failed",
            lastIndexError: "No OpenAI API key found. Please provide your API key when connecting a repository.",
          },
        });
      });
      return { success: false, error: "No OpenAI API key found. Please provide your API key when connecting a repository." };
    }

    const token = await step.run("get-token", async () => getGithubToken(userId));

    if (!token) {
      await step.run("mark-missing-github-token", async () => {
        await db.repository.update({
          where: { id: repository.id },
          data: {
            indexingStatus: "failed",
            lastIndexError: "No GitHub token found",
          },
        });
      });
      return { success: false, error: "No GitHub token found" };
    }

    try {
      const files = await step.run("fetch-files", async () => {
        try {
          return await getRepoFileContent(token, owner, repo);
        } catch (error) {
          console.error(`Failed to fetch files for ${owner}/${repo}:`, error);
          throw error;
        }
      });

      if (!files || files.length === 0) {
        await step.run("mark-indexing-empty", async () => {
          await db.repository.update({
            where: { id: repository.id },
            data: {
              indexingStatus: "completed",
              lastIndexedAt: new Date(),
              lastIndexError: null,
              indexedFileCount: 0,
              indexedChunkCount: 0,
            },
          });
        });
        return { success: true, filesProcessed: 0, chunksIndexed: 0, message: "No files to index" };
      }

      const indexed = await step.run("index-codebase", async () => {
        const allChunks = files.flatMap((file) =>
          chunkCode(file.path, file.content)
        );

        const batchSize = 50;
        let totalIndexed = 0;

        for (let i = 0; i < allChunks.length; i += batchSize) {
          const batch = allChunks.slice(i, i + batchSize);
          const texts = batch.map((chunk) =>
            prepareCodeForEmbedding(chunk.path, chunk.content)
          );

          const embeddings = await generateEmbeddings(texts, openaiApiKey);

          const storeCodeSnippets = shouldStoreCodeSnippets();
          const vectors = batch.map((chunk, idx) => {
            const metadata: Record<string, string | number> = {
              owner,
              repo,
              userId,
              path: chunk.path,
              startLine: chunk.startLine,
              endLine: chunk.endLine,
              contentHash: hashChunkContent(chunk.content),
            };

            if (storeCodeSnippets) {
              metadata.content = chunk.content.slice(0, 1000);
            }

            return {
              id: `${owner}/${repo}:${chunk.id}`,
              values: embeddings[idx],
              metadata,
            };
          });

          await pineconeIndex.namespace(`${owner}/${repo}`).upsert(vectors);
          totalIndexed += vectors.length;
        }

        return { chunksIndexed: totalIndexed };
      });

      await step.run("mark-indexing-completed", async () => {
        await db.repository.update({
          where: { id: repository.id },
          data: {
            indexingStatus: "completed",
            lastIndexedAt: new Date(),
            lastIndexError: null,
            indexedFileCount: files.length,
            indexedChunkCount: indexed.chunksIndexed,
          },
        });
      });

      return { success: true, filesProcessed: files.length, ...indexed };
    } catch (error) {
      await step.run("mark-indexing-failed", async () => {
        await db.repository.update({
          where: { id: repository.id },
          data: {
            indexingStatus: "failed",
            lastIndexError: error instanceof Error ? error.message : "Unknown indexing error",
          },
        });
      });

      throw error;
    }
  }
);
