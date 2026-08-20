import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

// Node/TCP client for the migrate and seed scripts, which run on regular
// Node (GitHub Actions), not the Cloudflare Workers runtime. The bot itself
// uses src/db/edgeClient.ts (HTTP-based, no TCP) instead.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing required env var: DATABASE_URL");
}

export const pool = new pg.Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
