import type { KnowledgeChunkWithEmbedding, RAGContext } from './types';
import { findSimilarChunks } from './retrieval';
import { embedQuery } from './embeddings';
import { buildSystemPrompt, buildFallbackPrompt } from './system-prompt';

// Load knowledge base once at module level
let knowledgeBase: KnowledgeChunkWithEmbedding[] | null = null;

async function loadKnowledgeBase(): Promise<KnowledgeChunkWithEmbedding[]> {
  if (knowledgeBase) {
    return knowledgeBase;
  }

  try {
    // Dynamic import for the knowledge file
    const knowledgeModule = await import('../../../data/knowledge.json');
    knowledgeBase = knowledgeModule.default as KnowledgeChunkWithEmbedding[];
    return knowledgeBase;
  } catch (error) {
    console.error('Failed to load knowledge base:', error);
    return [];
  }
}

/**
 * Build RAG context for a user message
 */
export async function buildRAGContext(userMessage: string): Promise<RAGContext> {
  const chunks = await loadKnowledgeBase();

  if (chunks.length === 0) {
    return {
      systemPrompt: buildFallbackPrompt(),
      retrievedChunks: [],
    };
  }

  // Generate embedding for the user's query
  const queryEmbedding = await embedQuery(userMessage);

  // Find similar chunks
  const retrievedChunks = findSimilarChunks(queryEmbedding, chunks, {
    topK: 5,
    threshold: 0.25,
  });

  // Build system prompt
  const systemPrompt =
    retrievedChunks.length > 0
      ? buildSystemPrompt(retrievedChunks)
      : buildFallbackPrompt();

  return {
    systemPrompt,
    retrievedChunks,
  };
}

/**
 * Extract the latest user message from a messages array
 */
export function getLatestUserMessage(
  messages: Array<{ role: string; content: string }>
): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      return messages[i].content;
    }
  }
  return null;
}
