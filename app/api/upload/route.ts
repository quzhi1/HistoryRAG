import { NextResponse } from 'next/server';
import { db, testConnection } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { generateEmbeddings } from '@/lib/ai/embedding';
import { embeddings } from '@/lib/db/schema/embeddings';

export async function POST(req: Request) {
  try {
    console.log('Starting upload process...');
    
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({ 
        error: 'Database connection failed' 
      }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file found in form data');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File received:', file.name);
    const content = await file.text();
    const jsonData = JSON.parse(content);

    if (!Array.isArray(jsonData)) {
      console.log('Invalid JSON format - not an array');
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }

    console.log('JSON parsed successfully, items:', jsonData.length);
    interface ProcessedItem {
      id: string;
      source: string;
      chapter: string;
    }
    const results: ProcessedItem[] = [];
    const totalItems = jsonData.length;

    // Create a TransformStream for streaming responses
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start processing in the background
    (async () => {
      try {
        // Process items in batches to show progress
        const batchSize = 5;
        for (let i = 0; i < jsonData.length; i += batchSize) {
          const batch = jsonData.slice(i, i + batchSize);
          
          for (const item of batch) {
            if (!item.source || !item.chapter || !item.text) {
              console.log('Skipping invalid item:', item);
              continue;
            }

            try {
              // Insert into resources table
              const [resource] = await db
                .insert(resources)
                .values({
                  content: item.text,
                  source: item.source,
                  chapter: item.chapter,
                })
                .returning();

              // Generate embeddings
              const embeddingResults = await generateEmbeddings(item.text);
              
              // Insert embeddings
              for (const embeddingResult of embeddingResults) {
                await db.insert(embeddings).values({
                  resourceId: resource.id,
                  content: embeddingResult.content,
                  embedding: embeddingResult.embedding,
                });
              }

              results.push({
                id: resource.id,
                source: item.source,
                chapter: item.chapter,
              });

            } catch (dbError) {
              console.error('Database error processing item:', dbError);
              continue;
            }
          }

          // Send progress update after each batch
          const processed = Math.min(i + batchSize, jsonData.length);
          console.log(`Processed ${processed} of ${totalItems} items`);
          
          await writer.write(encoder.encode(
            `data: ${JSON.stringify({
              type: 'progress',
              processed,
              total: totalItems,
            })}\n\n`
          ));
        }

        // Send final completion message
        await writer.write(encoder.encode(
          `data: ${JSON.stringify({
            type: 'complete',
            success: true,
            processed: results.length,
            total: totalItems,
            results,
          })}\n\n`
        ));
      } catch (error) {
        console.error('Error during processing:', error);
        await writer.write(encoder.encode(
          `data: ${JSON.stringify({
            type: 'error',
            error: 'Error processing file',
            details: error instanceof Error ? error.message : 'Unknown error',
          })}\n\n`
        ));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ 
      type: 'error',
      error: 'Error processing file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 