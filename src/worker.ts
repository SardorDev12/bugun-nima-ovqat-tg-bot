import { webhookCallback } from "grammy";
import { createBot } from "./bot/index.js";
import type { Env } from "./bot/context.js";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/healthz") {
      return new Response("ok");
    }

    if (request.method === "POST" && url.pathname === `/telegram/${env.WEBHOOK_SECRET}`) {
      const bot = createBot(env);
      return webhookCallback(bot, "cloudflare-mod")(request);
    }

    return new Response("Not found", { status: 404 });
  },
};
