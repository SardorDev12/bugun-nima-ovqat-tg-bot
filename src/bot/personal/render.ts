import { InlineKeyboard } from "grammy";
import type { meals } from "../../db/schema.js";

type Meal = typeof meals.$inferSelect;

const BUDGET_LABEL: Record<string, string> = {
  cheap: "Arzon",
  normal: "O'rtacha",
  any: "Farqi yo'q",
};

export function formatMealMessage(meal: Meal): string {
  const budget = BUDGET_LABEL[meal.budgetTier] ?? meal.budgetTier;

  return [
    `🍽 **${meal.nameUz}**`,
    "",
    `⏱ ${meal.cookTimeMinutes} daqiqa`,
    `👥 ${meal.servingsMin}–${meal.servingsMax} kishi`,
    `💰 ${budget}`,
  ].join("\n");
}

export function buildMealKeyboard(mealId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("👨‍🍳 Retsept", `recipe:${mealId}`)
    .text("🔄 Boshqa variant", `another:${mealId}`);
}

// "Boshqa variant" here must keep filtering by the same ingredient
// (/qidir), unlike the plain another:<mealId> callback which picks from
// all meals — so the ingredient rides along in the callback data.
export function buildIngredientMealKeyboard(mealId: string, ingredient: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("👨‍🍳 Retsept", `recipe:${mealId}`)
    .text("🔄 Boshqa variant", `ia:${ingredient}:${mealId}`);
}

export function formatRecipeMessage(meal: Meal, pantry: readonly string[] = []): string {
  const ingredientLines = meal.ingredientDetails
    .map((line, i) => {
      const haveIt = pantry.includes(meal.ingredients[i]);
      return `${haveIt ? "✅" : "•"} ${line}`;
    })
    .join("\n");
  const stepLines = meal.recipeSteps.map((step, i) => `${i + 1}. ${step}`).join("\n");

  return [
    `👨‍🍳 **${meal.nameUz}**`,
    "",
    "**Kerakli mahsulotlar:**",
    ingredientLines,
    "",
    "**Tayyorlash tartibi:**",
    stepLines,
  ].join("\n");
}
