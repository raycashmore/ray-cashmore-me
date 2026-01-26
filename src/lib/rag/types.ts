export interface KnowledgeChunk {
  id: string;
  content: string;
  type: 'experience' | 'skills' | 'identity' | 'contact' | 'boundaries';
  topics: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface KnowledgeChunkWithEmbedding extends KnowledgeChunk {
  embedding: number[];
}

export interface RetrievalResult {
  chunk: KnowledgeChunkWithEmbedding;
  similarity: number;
}

export interface RAGContext {
  systemPrompt: string;
  retrievedChunks: RetrievalResult[];
}
