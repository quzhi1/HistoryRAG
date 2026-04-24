import { sql } from 'drizzle-orm';
import { db } from './index';

let hasEnsuredFlexibleEmbeddings = false;

export async function ensureFlexibleEmbeddingsColumn() {
  if (hasEnsuredFlexibleEmbeddings) {
    return;
  }

  await db.execute(sql.raw(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'embeddings'
      ) THEN
        DROP INDEX IF EXISTS "embeddingIndex";
        DROP INDEX IF EXISTS embeddingindex;
        ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector;
      END IF;
    END $$;
  `));

  hasEnsuredFlexibleEmbeddings = true;
}
