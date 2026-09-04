import { webhookCallback } from "grammy";
import { handleAdminRequest } from "./admin/router.js";
import { createBot } from "./bot/index.js";
import type { Env } from "./bot/context.js";
import { createDb } from "./db/edgeClient.js";
import { handleWebAppApiRequest } from "./webapp/api.js";
import { WEBAPP_PAGE_HTML } from "./webapp/page.js";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/healthz") {
      return new Response("ok");
    }

    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      return handleAdminRequest(request, env, createDb(env.DATABASE_URL));
    }

    if (request.method === "GET" && url.pathname === "/app") {
      return new Response(WEBAPP_PAGE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (url.pathname.startsWith("/api/webapp/")) {
      return handleWebAppApiRequest(request, env.BOT_TOKEN, createDb(env.DATABASE_URL));
    }

    if (request.method === "POST" && url.pathname === `/telegram/${env.WEBHOOK_SECRET}`) {
      const bot = createBot(env, url.origin);
      return webhookCallback(bot, "cloudflare-mod")(request);
    }

    return new Response("Not found", { status: 404 });
  },
};
