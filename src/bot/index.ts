import { Bot } from "grammy";
import { env } from "../config/env.js";
import { personal } from "./personal/index.js";

export const bot = new Bot(env.BOT_TOKEN);

bot.use(personal);

bot.catch((err) => {
  console.error("Bot error:", err.error);
});

export async function registerCommands() {
  await bot.api.setMyCommands([
    { command: "nima_ovqat", description: "Bugungi taom tavsiyasi" },
    { command: "help", description: "Yordam" },
  ]);
}

bot.command("help", async (ctx) => {
  await ctx.reply(
    "\"Bugun nima ovqat?\" deb yozing yoki /nima_ovqat buyrug'ini yuboring — men sizga taom tavsiya qilaman.",
  );
});
