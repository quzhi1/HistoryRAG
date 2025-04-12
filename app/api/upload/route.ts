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
    const results = [];
    const totalItems = jsonData.length;

    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];
      if (!item.source || !item.chapter || !item.text) {
        console.log('Skipping invalid item:', item);
        continue;
      }

      console.log('Processing item', i + 1, 'of', totalItems);
      
      try {
        // Insert into resources table
        console.log('Inserting into resources table...');
        const [resource] = await db
          .insert(resources)
          .values({
            content: item.text,
            source: item.source,
            chapter: item.chapter,
          })
          .returning();

        console.log('Resource inserted:', resource.id);

        // Generate embeddings
        console.log('Generating embeddings...');
        const embeddingResults = await generateEmbeddings(item.text);
        console.log('Embeddings generated:', embeddingResults.length);
        
        // Insert embeddings
        console.log('Inserting embeddings...');
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
        // Continue with next item even if this one fails
        continue;
      }
    }

    console.log('Upload process completed');
    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      total: totalItems,
      results 
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ 
      error: 'Error processing file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 