import { webhookCallback } from "grammy";
import { handleAdminRequest } from "./admin/router.js";
import { createBot } from "./bot/index.js";
import type { Env } from "./bot/context.js";
import { createDb } from "./db/edgeClient.js";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/healthz") {
      return new Response("ok");
    }

    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      return handleAdminRequest(request, env, createDb(env.DATABASE_URL));
    }

    if (request.method === "POST" && url.pathname === `/telegram/${env.WEBHOOK_SECRET}`) {
      const bot = createBot(env);
      return webhookCallback(bot, "cloudflare-mod")(request);
    }

    return new Response("Not found", { status: 404 });
  },
};
