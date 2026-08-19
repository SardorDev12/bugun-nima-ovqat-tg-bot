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

Deploys are automated via GitHub Actions (`.github/workflows/deploy.yml`):
every push to `main` runs `flyctl deploy`. One-time setup:

```bash
fly apps create <app-name>   # then set `app = "<app-name>"` in fly.toml
fly secrets set BOT_TOKEN=... DATABASE_URL=... WEBHOOK_SECRET=... PUBLIC_URL=https://<app-name>.fly.dev
```

App secrets (`BOT_TOKEN`, `DATABASE_URL`, `WEBHOOK_SECRET`, `PUBLIC_URL`) live
only on Fly — they're set once via `fly secrets set` above and persist across
deploys, so they never need to touch GitHub or CI.

The GitHub Actions workflow itself needs exactly one repo secret to
authenticate `flyctl`:

1. Generate a deploy token: `fly tokens create deploy -x 999999h`
2. Add it in GitHub: repo Settings → Secrets and variables → Actions →
   New repository secret → name it `FLY_API_TOKEN`, paste the token value.

After that, pushing to `main` deploys automatically. To deploy manually
instead: `fly deploy` (needs `flyctl` installed and authenticated locally).

`fly deploy` runs Drizzle migrations automatically via the `release_command`
in `fly.toml`. Seed the meals table once after the first deploy:

```bash
fly ssh console -C "node dist/db/seed.js"
```

## Branching

All work happens on `develop`. `main` is deploy-only and is only updated
(merged) when explicitly requested.
