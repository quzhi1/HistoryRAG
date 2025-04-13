'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from '@/lib/db/schema/resources';
import { db } from '../db';
import { generateEmbeddings } from '../ai/embedding';
import { embeddings as embeddingsTable } from '../db/schema/embeddings';

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const [resource] = await db
      .insert(resources)
      .values({ 
        content,
        source: 'user_input', // Default value
        chapter: 'default'    // Default value
      })
      .returning();

    const embeddings = await generateEmbeddings(content);
    for (const embedding of embeddings) {
      await db.insert(embeddingsTable).values({
        resourceId: resource.id,
        ...embedding,
      });
    }

    return 'Resource successfully created and embedded.';
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};