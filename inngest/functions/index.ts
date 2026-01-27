import { inngest } from "../client";
import { db } from "../../lib/db";
import { getRepoFileContent } from "../../module/github/github";
import { chunkCode, generateEmbeddings, prepareCodeForEmbedding } from "../../lib/embeddings";
import { pineconeIndex } from "../../lib/pinecone";

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    const token = await step.run("get-token", async () => {
      const account = await db.account.findFirst({
        where: { userId, providerId: "github" },
        select: { accessToken: true },
      });
      return account?.accessToken ?? null;
    });

    if (!token) {
      return { success: false, error: "No GitHub token found" };
    }

    const files = await step.run("fetch-files", async () => {
      return getRepoFileContent(token, owner, repo);
    });

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

        const embeddings = await generateEmbeddings(texts);

        const vectors = batch.map((chunk, idx) => ({
          id: `${owner}/${repo}:${chunk.id}`,
          values: embeddings[idx],
          metadata: {
            owner,
            repo,
            userId,
            path: chunk.path,
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            content: chunk.content.slice(0, 1000),
          },
        }));

        await pineconeIndex.namespace(`${owner}/${repo}`).upsert(vectors);
        totalIndexed += vectors.length;
      }

      return { chunksIndexed: totalIndexed };
    });

    return { success: true, filesProcessed: files.length, ...indexed };
  }
);