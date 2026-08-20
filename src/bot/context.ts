import type { Context as BaseContext } from "grammy";
import type { Db } from "../db/types.js";

export interface Env {
  BOT_TOKEN: string;
  DATABASE_URL: string;
  WEBHOOK_SECRET: string;
}

export interface BotContext extends BaseContext {
  db: Db;
}
