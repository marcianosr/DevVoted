# ADR-012: One migration pipeline — guarded SQL in supabase/migrations

## Status

Accepted 2026-07-18. Resolves DVTD-jskv (diverged drizzle journal, orphan columns, push-vs-migrate ambiguity).

## Context

Two migration systems coexisted:

1. **`supabase/migrations/*.sql`** — hand-written, idempotent, guarded DO-block files. CI (`main.yaml`) applies them to production via `supabase db push` on every merge to main. This is the only mechanism that has ever touched PRD.
2. **`drizzle/` + `drizzle.__drizzle_migrations`** — drizzle-kit's generate/migrate pipeline. 61 generated files vs 63 journal entries on the dev DB: diverged and unrepairable without archaeology. Nothing in CI used it.

On top of that, the `runs` table carried four orphan columns from an abandoned scripts/packs experiment (`held_script_ids`, `fired_scripts`, `pending_pack`, `pack_storage_used`) — absent from `schema.ts`, which made every `drizzle-kit push` stop at interactive rename prompts. Data audit: two columns empty, two with exactly one row of experiment leftovers.

## Decision

1. **`src/database/schema.ts` is the source of truth for shape; `supabase/migrations` is the single pipeline for change.** Every schema change ships as a guarded, idempotent SQL file there (see the `20260717*`/`20260718*` files for the DO-block style), applied to dev by hand (tsx one-off or `db:push`) and to PRD by CI.
2. **The drizzle generate/migrate pipeline is retired.** `drizzle/` deleted (git history keeps it), the journal table dropped, `db:generate`/`db:migrate` scripts removed. `db:push` remains for local prototyping only — never for PRD.
3. **The orphan `runs` columns are dropped** via a guarded migration. The one-row experiment leftovers are knowingly discarded.

## Consequences

- One mental model: write a guarded SQL file, apply locally, merge — CI does PRD. No journal to keep honest.
- `db:push` no longer hits rename prompts (schema.ts and the DB agree again).
- Cost: no auto-generated diffs; migration files are written by hand. Acceptable — the guarded style has been the de-facto convention for every migration since the run rebuild, and hand-written files are reviewable.
- `db:refresh` re-scripted to `reset → push → seed` (no generate step). Superseded by the amendment below.

## Amendment 2026-10-08: a baseline, and legacy tables keep their data (DVTD-zvyz)

No migration created the base tables; they existed only because `db:push` built them. On an empty database every migration skipped itself, and on a push-built one the replay died on the retired `'open'` status value. Decision 1 promised a pipeline that could not build a database.

1. **`20251106000000_baseline.sql` is production's public schema** from `supabase db dump --linked --schema public`, dated before every other migration. It carries the current shape, so every later migration must be a no-op on top of it, and all of them are. Its guard is the usual one inverted: it skips itself when `public.polls` exists, so production and push-built databases are untouched. Production's history records it as applied (done 2026-10-08), because `supabase db push` refuses a migration older than the newest applied one.
2. **`db:refresh` rebuilds from migrations**: `supabase db reset --local`, then seed. The local database is built the way production changes. `db:push` stays for prototyping.
3. **Dead objects are dropped** (`active_tech_debts`, `runs.discounted_config_ids`, `runs.challenge_mode_id`): no code reads them and nothing in them is worth keeping.
4. **Retired tables that hold old players' data are renamed `legacy_*`, not dropped**: `daily_polls`, `leaderboard`, `seasons`, `run_category_coverage`, `run_shop_offerings`. They leave `schema.ts`, so the game cannot read them. `drizzle.config.ts` filters out `legacy_*`, so `db:push` never offers to drop them. Renaming keeps rows, foreign keys and RLS, and their cascade from `users` still deletes an account's legacy rows.
5. **Migration specs live in `supabase/tests/`**: they read SQL off disk, and the CLI tripped over them in `supabase/migrations/`.

Consequence: a schema diff against a rebuilt database shows exactly the `legacy_*` tables as database-only. That is expected, not drift.
