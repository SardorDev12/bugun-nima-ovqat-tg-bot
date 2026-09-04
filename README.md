# Nima ovqat?

Telegram bot that recommends what to cook. See `docs/PRD.md` for product
requirements and `docs/ARCHITECTURE.md` for technical design.

## Stack

TypeScript on [Cloudflare Workers](https://workers.cloudflare.com),
[grammY](https://grammy.dev), PostgreSQL (Neon) via
[Drizzle ORM](https://orm.drizzle.team) — the bot talks to Neon over HTTP
(`@neondatabase/serverless`), since Workers has no raw TCP sockets.

## Local setup

```bash
npm install
cp .env.example .env           # fill in BOT_TOKEN, DATABASE_URL, WEBHOOK_SECRET
cp .dev.vars.example .dev.vars # same values, plus ADMIN_PASSWORD — read by `wrangler dev`
npm run db:migrate
npm run db:seed
npm run dev                     # wrangler dev
```

`wrangler dev` runs the Worker locally (reading secrets from `.dev.vars`,
not `.env` — that file is only for the Node scripts above). To test against
real Telegram updates, expose it with a tunnel (e.g. `cloudflared tunnel
--url http://localhost:8787`) and run `npm run setup:webhook` with
`PUBLIC_URL` set to the tunnel URL.

### Admin panel

`/admin` (e.g. `http://localhost:8787/admin` locally, or
`https://nima-ovqat-bot.<your-subdomain>.workers.dev/admin` once deployed)
— a small UI to add/edit/delete meals, and view basic stats and the user
list. Protected by HTTP Basic Auth: any username, password is
`ADMIN_PASSWORD`.

### Mini App

`/app` — a Telegram Mini App covering the same three flows as the chat
commands (today's recommendation, ingredient search, pantry) as tabs
instead of typed commands. Reachable from the "🍽 Ilovani ochish" button on
`/start` or the chat's menu button. It only works when opened from inside
Telegram (it authenticates every request using Telegram's `initData`, not
a password), so visiting the URL directly in a browser just shows a
"faqat Telegram ichida ochiladi" message.

## Deploy (Cloudflare Workers)

Deploys are automated via GitHub Actions (`.github/workflows/deploy.yml`):
every push to `main` runs the migration, `wrangler deploy`, and registers
the Telegram webhook. One-time setup:

1. Create a Cloudflare API token (dashboard → My Profile → API Tokens →
   "Edit Cloudflare Workers" template) — no payment method required.
2. Add these as GitHub repo secrets (Settings → Secrets and variables →
   Actions):
   - `CLOUDFLARE_API_TOKEN` — the token from step 1
   - `BOT_TOKEN`, `DATABASE_URL`, `WEBHOOK_SECRET` — same values as `.env`
   - `ADMIN_PASSWORD` — password for the `/admin` panel
   - `PUBLIC_URL` — the Worker's URL, e.g.
     `https://nima-ovqat-bot.<your-subdomain>.workers.dev` (find your
     subdomain in the Cloudflare dashboard; the Worker name comes from
     `wrangler.toml`)
3. Push to `main` (or trigger the workflow manually) to deploy.

`BOT_TOKEN`, `DATABASE_URL`, `WEBHOOK_SECRET`, and `ADMIN_PASSWORD` are set
as Worker secrets on every deploy via `wrangler secret put` (idempotent) —
they never need a separate one-time setup step the way Fly's did.

To deploy manually instead: `npm run build && node dist/db/migrate.js &&
npm run deploy` (needs `wrangler` authenticated locally).

## Branching

`main` is the only branch. Every push to `main` deploys automatically via
GitHub Actions.
