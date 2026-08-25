import { Bot } from "grammy";
import { createDb } from "../db/edgeClient.js";
import type { BotContext, Env } from "./context.js";
import { personal } from "./personal/index.js";

/**
 * Builds a fresh Bot per request. Workers has no persistent boot lifecycle —
 * secrets only arrive via the `env` param passed to fetch() — so there's no
 * module-level singleton the way an always-on Node server would have one.
 */
export function createBot(env: Env): Bot<BotContext> {
  const bot = new Bot<BotContext>(env.BOT_TOKEN);
  const db = createDb(env.DATABASE_URL);

  bot.use((ctx, next) => {
    ctx.db = db;
    return next();
  });

  bot.use(personal);

  // Command names are Uzbek-only for now. Telegram supports per-language
  // command menus (setMyCommands' language_code param) for when other
  // languages are added — not needed while the bot is Uzbek-only.
  bot.command("yordam", async (ctx) => {
    await ctx.reply(
      "\"Bugun nima ovqat?\" deb yozing yoki /nima_ovqat buyrug'ini yuboring — men sizga taom tavsiya qilaman.",
    );
  });

  bot.catch((err) => {
    console.error("Bot error:", err.error);
  });

  return bot;
}
