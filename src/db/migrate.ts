import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing required env var: DATABASE_URL");
}

const pool = new pg.Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

await migrate(db, { migrationsFolder: "./src/db/migrations" });
console.log("Migrations applied.");
await pool.end();
