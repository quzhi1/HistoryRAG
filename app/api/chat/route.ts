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
    Before you respond, try to find the information online and verify it with the historical text.
    For example:
    If you have one piece of information "The capital of China is Beijing".
    The source of this information is "Book of Geography", and the chapter is "Chapter 1: China".
    You should respond:
    The capital of China is Beijing.
    Source: Book of Geography
    Chapter: Chapter 1: China
    Text: The capital of China is Beijing
    If you have multiple pieces of information, you should respond all of them.
    For example:
    If you have two pieces of information "The capital of China is Beijing" and "The capital of Japan is Tokyo".
    The source of the first information is "Book of Geography", the chapter is "Chapter 1: China" and the text is "The capital of China is Beijing".
    The source of the second information is "Book of Geography", the chapter is "Chapter 2: Japan" and the text is "The capital of Japan is Tokyo".
    Sometimes, the person and place in the historical text are not the same as the person and place in the question.
    For example, 长安 in the historical text is the modern day 西安. 高祖 in the historical text of 史记 is 刘邦.
    You should look up the information from the historical text and respond the correct information.
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