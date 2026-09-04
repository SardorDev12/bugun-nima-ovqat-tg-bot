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
// Strip any trailing slash so `${PUBLIC_URL}/app` etc. never doubles up
// (e.g. if the secret was pasted from a browser bar as ".../\").
const PUBLIC_URL = required("PUBLIC_URL").replace(/\/+$/, "");

const bot = new Bot(BOT_TOKEN);

async function main() {
  await bot.api.setMyCommands([
    { command: "nima_ovqat", description: "Bugungi taom tavsiyasi" },
    { command: "mahsulotlar", description: "Uydagi mahsulotlarni belgilash" },
    { command: "qidir", description: "Bitta mahsulot bo'yicha taom qidirish" },
  ]);

  const webhookUrl = `${PUBLIC_URL}/telegram/${WEBHOOK_SECRET}`;
  await bot.api.setWebhook(webhookUrl);
  console.log(`Webhook set to ${webhookUrl}`);

  // Best-effort: the "🍽 Ilovani ochish" button on /start reaches the Mini
  // App independently of this, so a failure here shouldn't block the
  // webhook registration above (which the bot can't function without).
  try {
    await bot.api.setChatMenuButton({
      menu_button: { type: "web_app", text: "Ilova", web_app: { url: `${PUBLIC_URL}/app` } },
    });
  } catch (err) {
    console.error("Failed to set chat menu button (non-fatal):", err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
