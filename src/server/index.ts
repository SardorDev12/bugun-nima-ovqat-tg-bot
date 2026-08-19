import { createServer } from "node:http";
import { webhookCallback } from "grammy";
import pino from "pino";
import { env } from "../config/env.js";
import { bot, registerCommands } from "../bot/index.js";

const logger = pino();
const handleUpdate = webhookCallback(bot, "http");
const webhookPath = `/telegram/${env.WEBHOOK_SECRET}`;

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
    return;
  }

  if (req.method === "POST" && req.url === webhookPath) {
    await handleUpdate(req, res);
    return;
  }

  res.writeHead(404);
  res.end();
});

async function start() {
  await registerCommands();

  if (env.PUBLIC_URL) {
    const webhookUrl = `${env.PUBLIC_URL}${webhookPath}`;
    await bot.api.setWebhook(webhookUrl);
    logger.info({ webhookUrl }, "Webhook registered");
  } else {
    logger.warn("PUBLIC_URL not set; skipping webhook registration");
  }

  server.listen(env.PORT, () => {
    logger.info(`Listening on port ${env.PORT}`);
  });
}

start().catch((err) => {
  logger.error(err, "Failed to start server");
  process.exit(1);
});
