import { embed, embedMany } from "ai";
import { google } from "@ai-sdk/google";

const embeddingModel = google.textEmbeddingModel("text-embedding-004");

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  });
  return embeddings;
}

export interface CodeChunk {
  id: string;
  path: string;
  content: string;
  startLine: number;
  endLine: number;
}

export function chunkCode(
  path: string,
  content: string,
  chunkSize: number = 100,
  overlap: number = 20
): CodeChunk[] {
  const lines = content.split("\n");
  const chunks: CodeChunk[] = [];

  for (let i = 0; i < lines.length; i += chunkSize - overlap) {
    const startLine = i;
    const endLine = Math.min(i + chunkSize, lines.length);
    const chunkContent = lines.slice(startLine, endLine).join("\n");

    if (chunkContent.trim().length === 0) continue;

    chunks.push({
      id: `${path}:${startLine}-${endLine}`,
      path,
      content: chunkContent,
      startLine,
      endLine,
    });

    if (endLine >= lines.length) break;
  }

  return chunks;
}

export function prepareCodeForEmbedding(path: string, content: string): string {
  const extension = path.split(".").pop() || "";
  return `File: ${path}\nLanguage: ${extension}\n\n${content}`;
}
