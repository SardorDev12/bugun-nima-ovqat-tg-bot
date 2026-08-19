import { and, eq, gte } from "drizzle-orm";
import { db } from "../db/client.js";
import { meals, userMealInteractions, users } from "../db/schema.js";
import { filterHardRestrictions } from "./filters.js";
import { scoreMeal, type RecommendationConstraints } from "./score.js";

const HISTORY_WINDOW_DAYS = 7;

async function getRecentMealIds(userId: string): Promise<Set<string>> {
  const since = new Date(Date.now() - HISTORY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({ mealId: userMealInteractions.mealId })
    .from(userMealInteractions)
    .where(
      and(
        eq(userMealInteractions.userId, userId),
        gte(userMealInteractions.createdAt, since),
      ),
    );
  return new Set(rows.map((r) => r.mealId));
}

export interface RankedMeal {
  meal: typeof meals.$inferSelect;
  score: number;
}

/**
 * Ranks all meals for a user, filtering out hard restrictions first.
 * Returns candidates sorted best-first so the caller can offer the top
 * result plus fall back to the next one for "🔄 Another option".
 */
export async function rankMealsForUser(
  userId: string,
  constraints: RecommendationConstraints = {},
): Promise<RankedMeal[]> {
  const [user, allMeals, recentMealIds] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.select().from(meals),
    getRecentMealIds(userId),
  ]);

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const eligible = filterHardRestrictions(allMeals, {
    dietaryPreferences: user.dietaryPreferences,
    dislikedIngredients: user.dislikedIngredients,
  });

  return eligible
    .map((meal) => ({ meal, score: scoreMeal(meal, recentMealIds, constraints) }))
    .sort((a, b) => b.score - a.score);
}
