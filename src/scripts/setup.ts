import "dotenv/config";
import { Bot } from "grammy";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const BOT_TOKEN = required("BOT_TOKEN");
const WEBHOOK_SECRET = required("WEBHOOK_SECRET");
// Parse and take .origin (scheme://host, no trailing slash/path) instead of
// raw string concatenation — the URL parser strips stray whitespace/newlines
// that can sneak into a pasted secret, which plain trimming would miss and
// which otherwise breaks host resolution when concatenated into a path.
const PUBLIC_URL = new URL(required("PUBLIC_URL")).origin;

const bot = new Bot(BOT_TOKEN);

async function main() {
  await bot.api.setMyCommands([
    { command: "start", description: "Interaktiv ilovani ochish" },
    { command: "nima_ovqat", description: "Bugungi taom tavsiyasi" },
    { command: "mahsulotlar", description: "Uydagi mahsulotlarni belgilash" },
    { command: "qidir", description: "Bitta mahsulot bo'yicha taom qidirish" },
  ]);

  const webhookUrl = `${PUBLIC_URL}/telegram/${WEBHOOK_SECRET}`;
  await bot.api.setWebhook(webhookUrl);
  console.log(`Webhook set to ${webhookUrl}`);

  // Menu button shows the command list — the "🍽 Ilovani ochish" button on
  // /start is the way into the Mini App instead.
  try {
    await bot.api.setChatMenuButton({ menu_button: { type: "commands" } });
  } catch (err) {
    console.error("Failed to set chat menu button (non-fatal):", err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
