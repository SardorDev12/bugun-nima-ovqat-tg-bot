import type { meals } from "../db/schema.js";

type Meal = typeof meals.$inferSelect;

export interface RecommendationConstraints {
  maxTimeMinutes?: number;
  budgetTier?: "cheap" | "normal" | "any";
  cuisine?: string;
}

/**
 * Implements the individual scoring formula from PRD §28:
 * Ingredient Match + Personal Preference + Time Match + Budget Match +
 * Cuisine Match + Variety + History.
 *
 * Ingredient Match is 0 until pantry tracking ships (Phase 3, PRD §13).
 * Personal Preference is already applied as a hard filter before scoring
 * (see engine/filters.ts), so it doesn't add further weight here.
 */
export function scoreMeal(
  meal: Meal,
  recentMealIds: ReadonlySet<string>,
  constraints: RecommendationConstraints,
): number {
  let score = 0;

  if (constraints.maxTimeMinutes !== undefined) {
    score += meal.cookTimeMinutes <= constraints.maxTimeMinutes ? 10 : -5;
  }

  if (constraints.budgetTier && constraints.budgetTier !== "any") {
    score += meal.budgetTier === constraints.budgetTier ? 8 : 0;
  }

  if (constraints.cuisine) {
    score += meal.cuisine === constraints.cuisine ? 8 : 0;
  }

  // Variety + History: avoid repeating what was already served this week.
  score += recentMealIds.has(meal.id) ? -20 : 5;

  // Small jitter so ties don't always resolve the same way.
  score += Math.random() * 2;

  return score;
}
