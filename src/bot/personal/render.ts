import { InlineKeyboard } from "grammy";
import type { meals } from "../../db/schema.js";

type Meal = typeof meals.$inferSelect;

const BUDGET_LABEL: Record<string, string> = {
  cheap: "Arzon",
  normal: "O'rtacha",
  any: "Farqi yo'q",
};

export function formatMealMessage(meal: Meal): string {
  const title = meal.nameEn ? `${meal.nameUz} (${meal.nameEn})` : meal.nameUz;
  const budget = BUDGET_LABEL[meal.budgetTier] ?? meal.budgetTier;

  return [
    `🍽 **${title}**`,
    "",
    `⏱ ${meal.cookTimeMinutes} daqiqa`,
    `👥 ${meal.servingsMin}–${meal.servingsMax} kishi`,
    `💰 ${budget}`,
  ].join("\n");
}

export function buildMealKeyboard(mealId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("👨‍🍳 Retsept", `recipe:${mealId}`)
    .text("🔄 Boshqa variant", `another:${mealId}`)
    .row()
    .text("💾 Saqlash", `save:${mealId}`);
}
