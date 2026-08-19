# Nima ovqat?

Telegram bot that recommends what to cook. See `docs/PRD.md` for product
requirements and `docs/ARCHITECTURE.md` for technical design.

## Stack

Node.js + TypeScript, [grammY](https://grammy.dev), PostgreSQL via
[Drizzle ORM](https://orm.drizzle.team), deployed on [Fly.io](https://fly.io).

## Local setup

```bash
npm install
cp .env.example .env   # fill in BOT_TOKEN, DATABASE_URL, WEBHOOK_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

Local dev runs the webhook server without registering a public webhook
(leave `PUBLIC_URL` empty) — use a tool like `ngrok`/`cloudflared` and set
`PUBLIC_URL` if you want to test against real Telegram updates, or point a
temporary webhook at the tunnel URL manually.

## Deploy (Fly.io)

```bash
fly apps create <app-name>   # then set `app = "<app-name>"` in fly.toml
fly secrets set BOT_TOKEN=... DATABASE_URL=... WEBHOOK_SECRET=... PUBLIC_URL=https://<app-name>.fly.dev
fly deploy
```

`fly deploy` runs Drizzle migrations automatically via the `release_command`
in `fly.toml`. Seed the meals table once after the first deploy:

```bash
fly ssh console -C "node dist/db/seed.js"
```

## Branching

All work happens on `develop`. `main` is deploy-only and is only updated
(merged) when explicitly requested.
