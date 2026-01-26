import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = 'text-embedding-3-small';

interface KnowledgeChunk {
  id: string;
  content: string;
  type: string;
  topics: string[];
  confidence: string;
}

interface KnowledgeChunkWithEmbedding extends KnowledgeChunk {
  embedding: number[];
}

async function generateEmbeddings() {
  const inputPath = join(process.cwd(), 'data', 'knowledge-source.json');
  const outputPath = join(process.cwd(), 'data', 'knowledge.json');

  console.log('Reading knowledge source...');
  const sourceData = readFileSync(inputPath, 'utf-8');
  const chunks: KnowledgeChunk[] = JSON.parse(sourceData);

  console.log(`Found ${chunks.length} chunks to embed`);

  const texts = chunks.map((chunk) => chunk.content);

  console.log('Generating embeddings via OpenAI...');
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });

  console.log('Processing embeddings...');
  const chunksWithEmbeddings: KnowledgeChunkWithEmbedding[] = chunks.map(
    (chunk, index) => ({
      ...chunk,
      embedding: response.data[index].embedding,
    })
  );

  console.log('Writing output file...');
  writeFileSync(outputPath, JSON.stringify(chunksWithEmbeddings, null, 2));

  console.log(`Done! Generated embeddings for ${chunks.length} chunks`);
  console.log(`Output written to: ${outputPath}`);

  // Log embedding dimensions for verification
  const dimensions = chunksWithEmbeddings[0]?.embedding.length;
  console.log(`Embedding dimensions: ${dimensions}`);
}

generateEmbeddings().catch((error) => {
  console.error('Error generating embeddings:', error);
  process.exit(1);
});
