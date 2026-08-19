import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  BOT_TOKEN: required("BOT_TOKEN"),
  DATABASE_URL: required("DATABASE_URL"),
  WEBHOOK_SECRET: required("WEBHOOK_SECRET"),
  PUBLIC_URL: process.env.PUBLIC_URL ?? "",
  PORT: Number(process.env.PORT ?? 8080),
};
