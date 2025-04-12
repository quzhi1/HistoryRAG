import { env } from "@/lib/env.mjs";
  
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { db } from './index';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

const migrationsDir = path.join(process.cwd(), 'lib/db/migrations');

const runMigrate = async () => {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  
const connection = postgres(env.DATABASE_URL, { max: 1 });

const db = drizzle(connection);


  console.log("⏳ Running migrations...");

  const start = Date.now();

  await migrate(db, { migrationsFolder: 'lib/db/migrations' });

  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");

  process.exit(0);
};

async function runMigration() {
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    await db.execute(sql.raw(migration));
    console.log(`Applied migration: ${file}`);
  }
}

if (require.main === module) {
  runMigration().catch(console.error);
}

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});