import { embed, embedMany } from "ai";
import { openai, createOpenAI } from "@ai-sdk/openai";

// Google v1beta has no working embedding models.
// Using OpenAI text-embedding-3-small (dimension: 1536) for RAG.
// Gemini is still used for code review generation.
const defaultEmbeddingModel = openai.embedding("text-embedding-3-small");

function getEmbeddingModel(apiKey?: string) {
  if (apiKey) {
    const customOpenAI = createOpenAI({ apiKey });
    return customOpenAI.embedding("text-embedding-3-small");
  }
  return defaultEmbeddingModel;
}

export async function generateEmbedding(text: string, apiKey?: string): Promise<number[]> {
  const { embedding } = await embed({
    model: getEmbeddingModel(apiKey),
    value: text,
  });

  return embedding;
}

export async function generateEmbeddings(
  texts: string[],
  apiKey?: string
): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: getEmbeddingModel(apiKey),
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

export function prepareCodeForEmbedding(
  path: string,
  content: string
): string {
  const extension = path.split(".").pop() || "";
  return `File: ${path}\nLanguage: ${extension}\n\n${content}`;
}
