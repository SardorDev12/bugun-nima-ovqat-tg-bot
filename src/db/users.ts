import { eq } from "drizzle-orm";
import { users } from "./schema.js";
import type { Db } from "./types.js";

export async function getOrCreateUser(db: Db, telegramUserId: number) {
  const existing = await db.query.users.findFirst({
    where: eq(users.telegramUserId, telegramUserId),
  });
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({ telegramUserId })
    .returning();
  return created;
}
