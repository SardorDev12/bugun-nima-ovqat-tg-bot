import { count, desc, eq } from "drizzle-orm";
import { meals, userMealInteractions, users } from "../../db/schema.js";
import type { Db } from "../../db/types.js";

export interface Stats {
  userCount: number;
  mealCount: number;
  interactionCounts: { interactionType: string; count: number }[];
  topMeals: { mealId: string; nameUz: string; count: number }[];
}

export async function getStats(db: Db): Promise<Stats> {
  const [[{ userCount }], [{ mealCount }], interactionCounts, topMeals] = await Promise.all([
    db.select({ userCount: count() }).from(users),
    db.select({ mealCount: count() }).from(meals),
    db
      .select({ interactionType: userMealInteractions.interactionType, count: count() })
      .from(userMealInteractions)
      .groupBy(userMealInteractions.interactionType),
    db
      .select({ mealId: userMealInteractions.mealId, nameUz: meals.nameUz, count: count() })
      .from(userMealInteractions)
      .innerJoin(meals, eq(userMealInteractions.mealId, meals.id))
      .where(eq(userMealInteractions.interactionType, "viewed"))
      .groupBy(userMealInteractions.mealId, meals.nameUz)
      .orderBy(desc(count()))
      .limit(10),
  ]);

  return { userCount, mealCount, interactionCounts, topMeals };
}
