import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";
import type { Db } from "./types.js";

/**
 * HTTP-based Neon client for the Cloudflare Workers runtime, which has no
 * raw TCP sockets. Cheap to construct per request — no connection pool to
 * manage, unlike the node-postgres client used by the Node-only migrate/seed
 * scripts (src/db/client.ts).
 */
export function createDb(databaseUrl: string): Db {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}
