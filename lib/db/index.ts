import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env.mjs";
import * as schema from './schema/resources';

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });

// Test database connection
export async function testConnection() {
  try {
    await client`SELECT 1`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

