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
const PUBLIC_URL = required("PUBLIC_URL");

const bot = new Bot(BOT_TOKEN);

async function main() {
  await bot.api.setMyCommands([
    { command: "nima_ovqat", description: "Bugungi taom tavsiyasi" },
    { command: "help", description: "Yordam" },
  ]);

  const webhookUrl = `${PUBLIC_URL}/telegram/${WEBHOOK_SECRET}`;
  await bot.api.setWebhook(webhookUrl);
  console.log(`Webhook set to ${webhookUrl}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
