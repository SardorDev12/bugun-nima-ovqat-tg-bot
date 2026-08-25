import { Composer } from "grammy";
import { eq } from "drizzle-orm";
import { meals, userMealInteractions } from "../../db/schema.js";
import { getOrCreateUser } from "../../db/users.js";
import { rankMealsForUser } from "../../engine/meals.js";
import type { BotContext } from "../context.js";
import { buildMealKeyboard, formatMealMessage, formatRecipeMessage } from "./render.js";

export const personal = new Composer<BotContext>();

const NATURAL_LANGUAGE_TRIGGER =
  /nima\s*(ovqat|pishir)|bugun\s*nima|tez\s*tayyor|go'shtsiz\s*variant|what should i cook/i;

async function recommendToday(ctx: BotContext) {
  if (!ctx.from) return;
  const user = await getOrCreateUser(ctx.db, ctx.from.id, ctx.from.username);
  const ranked = await rankMealsForUser(ctx.db, user.id);

  if (ranked.length === 0) {
    await ctx.reply("Hozircha sizga mos taom topilmadi. Keyinroq qayta urinib ko'ring.");
    return;
  }

  const top = ranked[0].meal;
  await ctx.db.insert(userMealInteractions).values({
    userId: user.id,
    mealId: top.id,
    interactionType: "viewed",
  });

  await ctx.reply(formatMealMessage(top), {
    parse_mode: "Markdown",
    reply_markup: buildMealKeyboard(top.id),
  });
}

personal.command("start", async (ctx) => {
  await ctx.reply(
    "Salom! Men — Nima ovqat? botiman. \"Bugun nima ovqat?\" deb yozing yoki /nima_ovqat buyrug'ini yuboring.",
  );
});

personal.command("nima_ovqat", recommendToday);

personal.on("message:text", async (ctx) => {
  if (ctx.chat.type === "private" && NATURAL_LANGUAGE_TRIGGER.test(ctx.message.text)) {
    await recommendToday(ctx);
  }
});

personal.callbackQuery(/^recipe:(.+)$/, async (ctx) => {
  const mealId = ctx.match[1];
  const meal = await ctx.db.query.meals.findFirst({ where: eq(meals.id, mealId) });
  if (!meal) {
    await ctx.answerCallbackQuery({ text: "Taom topilmadi." });
    return;
  }
  await ctx.answerCallbackQuery();
  await ctx.reply(formatRecipeMessage(meal), { parse_mode: "Markdown" });
});

personal.callbackQuery(/^another:(.+)$/, async (ctx) => {
  if (!ctx.from) return;
  const currentMealId = ctx.match[1];
  const user = await getOrCreateUser(ctx.db, ctx.from.id, ctx.from.username);

  await ctx.db.insert(userMealInteractions).values({
    userId: user.id,
    mealId: currentMealId,
    interactionType: "requested_another",
  });

  const ranked = await rankMealsForUser(ctx.db, user.id);
  const next = ranked.find((r) => r.meal.id !== currentMealId)?.meal;

  if (!next) {
    await ctx.answerCallbackQuery({ text: "Boshqa variant qolmadi." });
    return;
  }

  await ctx.db.insert(userMealInteractions).values({
    userId: user.id,
    mealId: next.id,
    interactionType: "viewed",
  });

  await ctx.answerCallbackQuery();
  await ctx.reply(formatMealMessage(next), {
    parse_mode: "Markdown",
    reply_markup: buildMealKeyboard(next.id),
  });
});
