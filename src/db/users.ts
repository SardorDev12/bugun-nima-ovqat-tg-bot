import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { users } from "./schema.js";

export async function getOrCreateUser(telegramUserId: number) {
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
