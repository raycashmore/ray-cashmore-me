import type { KnowledgeChunkWithEmbedding, RetrievalResult } from './types';

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Find the most similar chunks to a query embedding
 */
export function findSimilarChunks(
  queryEmbedding: number[],
  chunks: KnowledgeChunkWithEmbedding[],
  options: { topK?: number; threshold?: number } = {}
): RetrievalResult[] {
  const { topK = 5, threshold = 0.25 } = options;

  const results: RetrievalResult[] = chunks
    .map((chunk) => ({
      chunk,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .filter((result) => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return results;
}
