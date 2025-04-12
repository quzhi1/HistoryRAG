import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { sql } from 'drizzle-orm';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: `You are a helpful assistant that answers questions based on historical texts.
    Only respond to questions using information from tool calls.
    For each answer, include the source and chapter as references.
    If no relevant information is found in the tool calls, respond, "Sorry, I don't know.". 
    Answer in Chinese.`,
    tools: {
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => {
          const relevantContent = await findRelevantContent(question);
          const results = await Promise.all(
            relevantContent.map(async (item) => {
              const resource = await db
                .select()
                .from(resources)
                .where(sql`${resources.id} = ${item.resourceId}`)
                .limit(1);
              
              return {
                ...item,
                source: resource[0]?.source,
                chapter: resource[0]?.chapter,
              };
            })
          );
          return results;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}