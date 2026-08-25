# Nima ovqat? — Technical Architecture

**Companion to:** `docs/PRD.md`
**Status:** Draft for Phase 1 build

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Cloudflare Workers + TypeScript | Free with no card required and no idle-suspension risk (unlike Fly's trial, which suspended the whole app — see hosting plan below). Request-scoped execution model fits a webhook-driven bot naturally. |
| Bot framework | [grammY](https://grammy.dev) | TS-first, has a native Cloudflare Workers (module worker) adapter, session/conversations plugins cover group flows in §6–§9 of the PRD without extra libraries. |
| Database | PostgreSQL (Neon, free tier) | Matches PRD §39 architecture diagram; Neon's free plan (0.5GB storage, autosuspend when idle) costs $0 and needs no server to manage. |
| DB driver (bot) | [`@neondatabase/serverless`](https://github.com/neondatabase/serverless) + `drizzle-orm/neon-http` | Workers has no raw TCP sockets, so the bot talks to Neon over HTTP. Cheap to instantiate per request — no connection pool to manage. |
| DB driver (scripts) | `pg` + `drizzle-orm/node-postgres` | The migrate/seed scripts run on regular Node (GitHub Actions), which has TCP — no reason to give those up the simpler driver. |
| ORM | [Drizzle ORM](https://orm.drizzle.team) | Lightweight, SQL-like, easy migrations; same schema definitions work against both drivers above. |
| Scheduler (Phase 2) | Cloudflare Cron Triggers | Workers has no persistent process to run an interval loop in — cron triggers are the platform-native equivalent, firing a scheduled handler that queries due groups and sends messages. |
| Hosting | Cloudflare Workers (free plan, 100k requests/day) | Decided after Fly's trial-account suspension — see hosting plan below. |
| Bot transport | Webhook, not polling | Workers only runs code in response to a request — there's no long-running process to poll from, so webhook is the only option, and a good one: Telegram's POST triggers the Worker directly, no cold-start "sleep" the way VM free tiers have. |
| Logging | `console.log`/`console.error` | Cloudflare's dashboard has a live log tail (`wrangler tail`) and request logs built in — no need for a separate structured-logging library. |

---

## 2. Hosting plan (recap)

- Cloudflare Workers, free plan — no payment method required, no idle-suspension risk. (Fly.io was tried first; its trial account suspended the whole app once resource limits were hit, and avoiding a card entirely was the priority — see chat history for the full comparison.)
- Stateless by design — every request is independent, so there's no persistent process, no volume, nothing to keep "warm."
- The database lives on Neon (unaffected by this change) — same Postgres instance, just accessed over HTTP instead of TCP from the bot.
- Secrets (`BOT_TOKEN`, `DATABASE_URL`, `WEBHOOK_SECRET`) set via `wrangler secret put`, never committed.
- One `wrangler.toml`, one entry point (`src/worker.ts`). Deploys run from the `main` branch only (see §7).

---

## 3. Project structure

```text
src/
  worker.ts              # Cloudflare Workers entry point: fetch() -> /admin, webhook, /healthz
  admin/
    router.ts             # /admin* dispatcher, HTTP Basic Auth gate
    auth.ts                # ADMIN_PASSWORD check
    page.ts                 # single-page HTML/JS admin UI (meals CRUD, stats, users)
    api/
      meals.ts               # meals list/create/update/delete + input validation
      stats.ts                # user/meal counts, interaction breakdown, top meals
      users.ts                 # user list
  bot/
    index.ts             # createBot(env): grammY Bot factory, middleware wiring
    context.ts            # Env (Worker bindings) + BotContext (grammY Context + ctx.db) types
    personal/             # Personal Mode composer (§5 of PRD)
    group/                 # Group Mode composer (§6–§23)
      onboarding.ts        # enable Group Mode, preference wizard (§11)
      recommendation.ts    # daily message composition + buttons (§8–§9)
      voting.ts             # vote tallying, "Kelishdik!" threshold (§9)
      admin.ts               # admin-only settings commands (§22)
    commands/              # /nima_ovqat /another /recipe /vote /pantry /history ...
  engine/
    score.ts              # individual + group scoring (§28)
    filters.ts            # hard dietary-restriction filtering
    meals.ts              # meal lookup/query helpers (takes db as a parameter)
  scheduler/
    cron.ts               # Phase 2: Cloudflare Cron Trigger handler, timezone-aware (§24)
  db/
    schema.ts             # Drizzle table defs (§4 below) — shared by both drivers
    edgeClient.ts          # createDb(): Neon HTTP driver, used by the Worker at request time
    client.ts               # Neon TCP driver (pg), used only by migrate.ts/seed.ts on Node
    migrate.ts
    seed.ts
    migrations/
  scripts/
    setup.ts               # one-off: registers Telegram commands + webhook after a deploy
docs/
  PRD.md
  ARCHITECTURE.md
wrangler.toml
```

---

## 4. Data model

Directly implements PRD §24–§27, plus a `meals` table the PRD assumes but doesn't fully specify.

```text
users
  id                 uuid pk
  telegram_user_id   bigint unique
  language           text            -- uz | ru | en
  dietary_preferences text[]
  disliked_ingredients text[]
  created_at         timestamptz

meals
  id                 uuid pk
  name_uz            text
  name_en            text
  cuisine            text            -- uzbek | central_asian | russian | ...
  ingredients        text[]          -- bare ingredient names, used for filtering/matching
  ingredient_details text[]          -- same ingredients formatted with quantities for display
  cook_time_minutes  int
  servings_min       int
  servings_max       int
  budget_tier        text            -- cheap | normal | any
  dietary_tags       text[]          -- vegetarian, no_beef, halal, etc.
  recipe_steps       text[]          -- ordered step-by-step instructions

groups
  id                       uuid pk
  telegram_chat_id         bigint unique
  name                     text
  timezone                 text default 'Asia/Tashkent'
  household_size           text            -- 1-2 | 3-4 | 5-6 | 7+ | variable
  cuisine_preferences      text[]
  dietary_preferences      text[]
  disliked_ingredients     text[]
  cooking_time_preference  text
  budget_preference        text
  recommendation_enabled   boolean default false   -- opt-in, PRD §33
  recommendation_time      time default '17:00'
  created_at               timestamptz
  updated_at               timestamptz

group_members
  id                 uuid pk
  group_id           uuid fk -> groups
  user_id            uuid fk -> users
  role               text            -- admin | member
  joined_at          timestamptz

group_meal_interactions
  id                 uuid pk
  group_id           uuid fk -> groups
  meal_id            uuid fk -> meals
  user_id            uuid fk -> users
  interaction_type   text  -- viewed | accepted | rejected | requested_another | cooked | saved
  created_at         timestamptz
```

`group_schedules` from PRD §24 is folded into `groups.recommendation_time` / `.timezone` / `.recommendation_enabled` directly — a separate table isn't needed until schedules become more complex than "one time per group."

---

## 5. Scheduler design (Phase 2)

Workers has no persistent process to run an interval loop in, so this uses
a [Cloudflare Cron Trigger](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
instead — a `scheduled(event, env, ctx)` handler configured in `wrangler.toml`
to fire every few minutes:

```text
on cron tick (every ~5 min, per wrangler.toml [triggers] crons):
  now_utc = current time
  SELECT groups WHERE recommendation_enabled = true
  for each group:
    local_now = now_utc converted to group.timezone
    if local_now falls within the tick window around group.recommendation_time:
      if not already sent today (check group_meal_interactions for today's "viewed"):
        run recommendation engine for group -> pick meal -> send message
```

Cron Triggers are part of the same free Workers plan — no separate service,
no extra cost.

---

## 6. Recommendation engine

Implements PRD §28 scoring directly:

- `filters.ts` removes meals violating **hard** restrictions (allergies, explicit exclusions) before scoring — never scored, never shown.
- `score.ts` computes the weighted sum (ingredient match, preference match, time, budget, cuisine, variety vs. recent history, seasonal match) and returns the top candidate plus the next-best as the "🔄 Another option" fallback.
- Recently-served meals (within 7 days per group, per PRD §18) are penalized/excluded via a query against `group_meal_interactions`.

---

## 6a. Admin panel

Served from the same Worker at `/admin` — no separate deployment, no
extra infra. A single-page vanilla HTML/JS UI (`admin/page.ts`) talks to a
small JSON API (`admin/api/*`) under `/admin/api/*`, all gated by one
`isAuthorized()` check in `admin/router.ts` before any route runs.

- **Auth**: HTTP Basic Auth against the `ADMIN_PASSWORD` secret — the
  browser's built-in login prompt, no extra dependency. Not hardened
  against timing attacks; acceptable for this project's stakes, revisit
  if that changes.
- **Meals**: full CRUD. This is the main reason the panel exists — before
  it, adding or fixing a dish meant editing `seed.ts` and redeploying.
  Deleting a meal also clears its `user_meal_interactions` rows first
  (no cascade on that foreign key).
- **Stats**: read-only — user/meal counts, interaction counts by type,
  top-10 meals by view count.
- **Users**: read-only list (most recent 200) of registered users and
  their stated dietary preferences/restrictions.

---

## 7. Deployment flow

- All work happens on `develop`; `main` is deploy-only and only updated when told to merge.
- `wrangler deploy` is run against `main` via GitHub Actions — i.e., deploys happen from the branch that's been explicitly promoted, not automatically on every `develop` push.
- Migrations run as an explicit step (`node dist/db/migrate.js`) before `wrangler deploy`, so the schema is ready before the new code goes live.
- `wrangler secret put` runs after deploy (idempotent — safe on every run) to keep Worker secrets in sync with GitHub Actions secrets.
- The Telegram webhook is (re-)registered via `src/scripts/setup.ts` as the final step — cheap and idempotent, so re-running it on every deploy is fine.

---

## 8. Build order (maps to PRD §40)

1. **Phase 1** — `bot/personal`, `engine/`, `meals` table seeded with a starter dataset, webhook + Cloudflare Workers deploy working end-to-end.
2. **Phase 2** — `bot/group/*`, `scheduler/cron.ts` (Cloudflare Cron Trigger), `groups`/`group_members`/`group_meal_interactions` tables, voting.
3. **Phase 3** — pantry, member-level preferences, better ranking.
4. **Phase 4** — monetization hooks (deferred, no infra impact now).
