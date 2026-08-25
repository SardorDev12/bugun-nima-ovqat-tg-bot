import type { meals } from "../db/schema.js";

type Meal = typeof meals.$inferSelect;

export interface RecommendationConstraints {
  maxTimeMinutes?: number;
  budgetTier?: "cheap" | "normal" | "any";
  cuisine?: string;
}

const INGREDIENT_MATCH_WEIGHT = 15;

/**
 * Implements the individual scoring formula from PRD §28:
 * Ingredient Match + Personal Preference + Time Match + Budget Match +
 * Cuisine Match + Variety + History.
 *
 * Ingredient Match compares `meal.ingredients` against the user's pantry
 * (/mahsulotlarim) — proportional to how much of the meal they can already
 * make. An empty pantry contributes 0, same as before pantry tracking
 * existed, so this stays optional per PRD §13.
 *
 * Personal Preference is already applied as a hard filter before scoring
 * (see engine/filters.ts), so it doesn't add further weight here.
 */
export function scoreMeal(
  meal: Meal,
  recentMealIds: ReadonlySet<string>,
  constraints: RecommendationConstraints,
  pantry: readonly string[] = [],
): number {
  let score = 0;

  if (pantry.length > 0) {
    const matchCount = meal.ingredients.filter((ingredient) => pantry.includes(ingredient)).length;
    score += (matchCount / meal.ingredients.length) * INGREDIENT_MATCH_WEIGHT;
  }

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
