import { desc } from "drizzle-orm";
import { users } from "../../db/schema.js";
import type { Db } from "../../db/types.js";

const MAX_USERS = 200;

export async function listUsers(db: Db) {
  return db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(MAX_USERS);
}
