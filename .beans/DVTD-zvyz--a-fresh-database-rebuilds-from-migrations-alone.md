---
# DVTD-zvyz
title: A fresh database rebuilds from migrations alone
status: completed
type: task
priority: normal
created_at: 2026-10-08T08:20:27Z
updated_at: 2026-10-08T08:36:02Z
parent: DVTD-erjz
---

**What:** A baseline migration taken from production lets an empty database build the whole schema from migrations alone.

**Why:** Today only db:push creates the base tables, so no fresh database (CI, a teammate, a prod copy) can be rebuilt the way production changes.

## Done when

- [x] An empty local database rebuilds from migrations with no errors and no skipped migrations
- [x] The rebuilt database matches the schema definition with no drift
- [x] The seed runs on the rebuilt database
- [x] Production's migration history records the baseline as applied, and nothing else changes there

## Notes

Plan: guarded baseline 20251106000000 from `supabase db dump --linked`, inverted guard (skips when public.polls exists), daily_polls 'open' enum replay fix, migration specs moved to supabase/tests, db:refresh via `supabase db reset --local`. Prod step: `npx supabase migration repair --linked --status applied 20251106000000`, run by hand before merge.

Dead and legacy tables (2026-10-08, Marciano): dropped active_tech_debts, runs.discounted_config_ids, runs.challenge_mode_id (no code references). Renamed to legacy_* to keep their old data: daily_polls, leaderboard, seasons, run_category_coverage, run_shop_offerings; removed from schema.ts, drizzle.config tablesFilter !legacy_* so db:push leaves them. daily_exposed_deck left as is. runs.season_id kept as a plain integer in schema.ts; the prod FK to legacy_seasons stays.

## Summary of Changes

Guarded baseline 20251106000000 from the prod dump (inverted guard), daily_polls status::text replay fix, migration specs moved to supabase/tests, db:refresh = supabase db reset --local + seed. Dropped three dead objects (20261008120000), renamed five old-data tables to legacy_* (20261008130000), removed them from schema.ts, drizzle tablesFilter !legacy_*. Prod history repaired by Marciano 2026-10-08. ADR-012 amended; production-release.md documents repair --linked. Verified: db reset --local clean (42 migrations), schema diff shows only legacy_* as DB-only, seed OK, 331 files / 6043 tests, lint, build.
