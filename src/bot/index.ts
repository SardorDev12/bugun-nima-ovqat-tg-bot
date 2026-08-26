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

  bot.catch((err) => {
    console.error("Bot error:", err.error);
  });

  return bot;
}
