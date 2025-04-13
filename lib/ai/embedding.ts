import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';

const embeddingModel = openai.embedding('text-embedding-ada-002');

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(/[。！？!?]/)
    .filter(i => i.trim().length > 0)
    .map(i => i.trim());
};

export { generateChunks };

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  // console.log('Original text:', value);
  const chunks = generateChunks(value);
  // console.log('Number of chunks:', chunks.length);
  // console.log('Chunks:', chunks);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  // console.log('Number of embeddings:', embeddings.length);
  const result = embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
  // console.log('Final result:', result.map(r => r.content));
  return result;
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;
  const similarGuides = await db
    .select({ 
      content: embeddings.content, 
      resourceId: embeddings.resourceId,
      similarity 
    })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy(t => desc(t.similarity))
    .limit(4);
  return similarGuides;
};