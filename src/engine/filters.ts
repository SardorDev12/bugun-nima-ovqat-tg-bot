import type { meals } from "../db/schema.js";

type Meal = typeof meals.$inferSelect;

export interface UserRestrictions {
  dietaryPreferences: string[];
  dislikedIngredients: string[];
}

/**
 * Removes meals that violate the user's hard restrictions. For personal
 * mode, disliked ingredients and stated dietary preferences (e.g.
 * "vegetarian") are both treated as hard excludes — unlike group mode,
 * there's no other member's preference to balance against.
 */
export function filterHardRestrictions(candidates: Meal[], restrictions: UserRestrictions): Meal[] {
  return candidates.filter((meal) => {
    const hasDislikedIngredient = meal.ingredients.some((ingredient) =>
      restrictions.dislikedIngredients.includes(ingredient),
    );
    if (hasDislikedIngredient) return false;

    const violatesDietaryPreference = restrictions.dietaryPreferences.some(
      (pref) => !meal.dietaryTags.includes(pref),
    );
    if (restrictions.dietaryPreferences.length > 0 && violatesDietaryPreference) return false;

    return true;
  });
}
