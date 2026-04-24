DO $$
BEGIN
  -- Only alter if the embeddings table exists (skip on fresh installs)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'embeddings'
  ) THEN
    -- Vector indexes (HNSW/IVFFlat) on mixed-dimension vectors can fail inserts.
    -- Drop old index so variable dimensions can be stored safely.
    DROP INDEX IF EXISTS "embeddingIndex";
    DROP INDEX IF EXISTS embeddingindex;

    ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector;
  END IF;
END $$;
