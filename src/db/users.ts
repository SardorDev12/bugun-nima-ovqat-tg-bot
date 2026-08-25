import { eq } from "drizzle-orm";
import { users } from "./schema.js";
import type { Db } from "./types.js";

export async function getOrCreateUser(db: Db, telegramUserId: number, username?: string) {
  const normalizedUsername = username ?? null;
  const existing = await db.query.users.findFirst({
    where: eq(users.telegramUserId, telegramUserId),
  });

  if (existing) {
    if (normalizedUsername !== existing.username) {
      const [updated] = await db
        .update(users)
        .set({ username: normalizedUsername })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    }
    return existing;
  }

  const [created] = await db
    .insert(users)
    .values({ telegramUserId, username: normalizedUsername })
    .returning();
  return created;
}
