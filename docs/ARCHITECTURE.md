# Nima ovqat? — Technical Architecture

**Companion to:** `docs/PRD.md`
**Status:** Draft for Phase 1 build

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 20 LTS + TypeScript | Team preference; TS catches schema/type drift between bot, engine, and DB. |
| Bot framework | [grammY](https://grammy.dev) | TS-first, built-in webhook helper, session/conversations plugins cover group flows in §6–§9 of the PRD without extra libraries. |
| Database | PostgreSQL (Neon, free tier) | Matches PRD §39 architecture diagram; Neon's free plan (0.5GB storage, autosuspend when idle) costs $0 and needs no server to manage. |
| ORM | [Drizzle ORM](https://orm.drizzle.team) | Lightweight (no bundled query-engine binary, unlike Prisma) — matters on a 256MB Fly.io machine. SQL-like, easy migrations. |
| Scheduler | In-process interval loop (no cron daemon) | Every 60s, query groups whose `recommendation_time` (converted to UTC via their `timezone`) matches now; fire the daily message. One process, zero extra infra. |
| Hosting | Fly.io (shared-cpu-1x, 256MB, single always-on machine) | Decided earlier — see hosting plan below. |
| Bot transport | Webhook, not polling | Fly.io machines get a public HTTPS URL for free; a webhook avoids a continuous poll loop burning CPU credits, and delivers updates to the bot the instant Telegram receives them. |
| Logging | pino | Minimal overhead, structured JSON logs (useful since Fly's free tier has no persistent log storage — pipe to `fly logs` or a free tier like Axiom later). |

---

## 2. Hosting plan (recap)

- Single Fly.io app, one always-on machine (`shared-cpu-1x`, 256MB) — free within Fly's monthly allowance for this traffic level.
- No Fly volume needed — the database lives on Neon, not on-machine, so the app itself is stateless and trivially redeployable.
- Secrets (`BOT_TOKEN`, `DATABASE_URL`, `WEBHOOK_SECRET`) set via `fly secrets set`, never committed.
- One Dockerfile, one `fly.toml`. `fly deploy` from the `main` branch only (see §7).

---

## 3. Project structure

```text
src/
  bot/
    index.ts            # grammY Bot instance, middleware wiring
    personal/            # Personal Mode composer (§5 of PRD)
    group/                # Group Mode composer (§6–§23)
      onboarding.ts       # enable Group Mode, preference wizard (§11)
      recommendation.ts   # daily message composition + buttons (§8–§9)
      voting.ts            # vote tallying, "Kelishdik!" threshold (§9)
      admin.ts              # admin-only settings commands (§22)
    commands/             # /today /another /recipe /vote /pantry /history ...
    middleware/           # context-mode detection (private vs group), auth
  engine/
    score.ts             # individual + group scoring (§28)
    filters.ts           # hard dietary-restriction filtering
    meals.ts             # meal lookup/query helpers
  scheduler/
    worker.ts            # interval loop, timezone-aware trigger (§24)
  db/
    schema.ts            # Drizzle table defs (§4 below)
    client.ts            # Neon connection
    migrations/
  server/
    index.ts             # tiny HTTP server: webhook endpoint + /healthz
  config/
    env.ts               # typed env var loading/validation
docs/
  PRD.md
  ARCHITECTURE.md
Dockerfile
fly.toml
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
  ingredients        text[]
  cook_time_minutes  int
  servings_min       int
  servings_max       int
  budget_tier        text            -- cheap | normal | any
  dietary_tags       text[]          -- vegetarian, no_beef, halal, etc.
  season             text[]          -- optional seasonality
  recipe_text        text

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

## 5. Scheduler design

```text
every 60s:
  now_utc = current time
  SELECT groups WHERE recommendation_enabled = true
  for each group:
    local_now = now_utc converted to group.timezone
    if local_now.hour:minute == group.recommendation_time (± the 60s tick window):
      if not already sent today (check group_meal_interactions for today's "viewed"):
        run recommendation engine for group -> pick meal -> send message
```

Runs inside the same process as the webhook server (one Fly machine, one Node process) — no separate worker dyno, keeping the whole thing inside the free allowance.

---

## 6. Recommendation engine

Implements PRD §28 scoring directly:

- `filters.ts` removes meals violating **hard** restrictions (allergies, explicit exclusions) before scoring — never scored, never shown.
- `score.ts` computes the weighted sum (ingredient match, preference match, time, budget, cuisine, variety vs. recent history, seasonal match) and returns the top candidate plus the next-best as the "🔄 Another option" fallback.
- Recently-served meals (within 7 days per group, per PRD §18) are penalized/excluded via a query against `group_meal_interactions`.

---

## 7. Deployment flow

- All work happens on `develop`; `main` is deploy-only and only updated when told to merge.
- `fly deploy` is run against `main` — i.e., deploys happen from the branch that's been explicitly promoted, not automatically on every `develop` push.
- Migrations run via a `fly deploy` release command (Drizzle migration script) before the new machine takes traffic.

---

## 8. Build order (maps to PRD §40)

1. **Phase 1** — `bot/personal`, `engine/`, `meals` table seeded with a starter dataset, webhook + Fly deploy working end-to-end.
2. **Phase 2** — `bot/group/*`, `scheduler/worker.ts`, `groups`/`group_members`/`group_meal_interactions` tables, voting.
3. **Phase 3** — pantry, member-level preferences, better ranking.
4. **Phase 4** — monetization hooks (deferred, no infra impact now).
