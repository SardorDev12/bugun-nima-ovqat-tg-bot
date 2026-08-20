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

export function formatRecipeMessage(meal: Meal): string {
  const ingredientLines = meal.ingredientDetails.map((line) => `• ${line}`).join("\n");
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
