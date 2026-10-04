---
# DVTD-vs2h
title: Seed data for DevVoted 2.0 game
status: completed
type: task
priority: normal
created_at: 2026-07-24T15:27:12Z
updated_at: 2026-09-19T14:58:06Z
parent: DVTD-82c4
---

Create comprehensive seed data including polls, configs, categories, and test user accounts for the new 2.0 game

## Seed Data Categories

### Polls
- [ ] Create 50+ diverse dev/tech trivia polls across categories
- [ ] Mix difficulty levels: easy, medium, hard
- [ ] Include code examples in poll questions (QuestionMarkdown)
- [ ] Ensure coverage of all categories:
  - JavaScript/TypeScript
  - React/Frontend
  - Backend/Databases
  - DevOps/Infrastructure
  - Testing/QA
  - Performance
  - Security
  - Web Standards
- [ ] Validate poll answers and explanations are clear

### Configs
- [ ] Create full config roster (20-30 configs):
  - Copilot (legendary, 2x coverage)
  - Code Coverage (uncommon, +0.5 coverage)
  - ESLint (defense, prevents bugs)
  - Stylelint (defense)
  - Intellisense (storage economy)
  - IndexedDB (storage economy)
  - Plus 5-10 new configs for 2.0
- [ ] Set rarity tiers and costs
- [ ] Define unlock conditions/thresholds
- [ ] Create descriptions and explanations

### Categories
- [ ] Ensure database has all 8+ dev categories
- [ ] Set category colors/themes (using Kanto palette)
- [ ] Create category badges/icons
- [ ] Seed category coverage thresholds

### Test Users
- [ ] Create 5-10 test accounts with different progression states:
  - Beginner (0 runs, no upgrades)
  - Active player (20+ runs, some configs unlocked)
  - Veteran (100+ runs, maxed configs)
  - Power user (daily player, full progression)
- [ ] Assign vault KB balances
- [ ] Set unlocked configs per user
- [ ] Create run history with varied results

### Runs/Pipeline Data
- [ ] Create sample run data for testing:
  - Completed runs with results
  - Failed runs (various gate levels)
  - Runs with different configs
  - Runs with streak data
  - Runs with coverage breakdowns
- [ ] Include timestamps for realistic data
- [ ] Set up community leaderboard data

## Seed Script

### Database Seeding
- [ ] Create npm run db:seed script
- [ ] Seed in logical order (categories → polls → configs → users → runs)
- [ ] Use factories from @/src/test/createMockDataFactory.ts
- [ ] Handle relationships (foreign keys)
- [ ] Idempotent: safe to run multiple times

### Development vs Production
- [ ] Seed dev database with full test data
- [ ] Seed prod database with initial polls only (no test users)
- [ ] Clear script to distinguish environments
- [ ] Document seed process in README

## Data Quality Checks

### Validation
- [ ] All polls have valid questions and answers
- [ ] All configs have descriptions
- [ ] No missing required fields
- [ ] Categories are consistent and complete
- [ ] Test data is realistic (not absurd edge cases)

### Coverage
- [ ] Every category has 5+ polls
- [ ] Every rarity has 3-5 configs
- [ ] Test users cover all progression states
- [ ] Run data spans date range (not all today)

## Documentation
- [ ] Document seed data structure in README
- [ ] List test user credentials (email/password)
- [ ] Explain how to reset/reseed database
- [ ] Include sample data queries for verification

## Summary of Changes

Replaced both seed scripts with one Pokemon-cast seed for the 2.0 engine.

**Deleted:** `src/database/seed.ts` (830 lines, legacy engine: seasons,
leaderboard, run_category_coverage, pipeline_slots — zero hits from
`src/modules/**`) and `src/database/seedCommunity.ts` (absorbed).

**Created** `src/database/seed/`: `index.ts` (orchestrator), `cast.ts`,
`questions.ts`, `authUsers.ts`, `runs.ts`, `random.ts`.

**Modified:** `package.json` (dropped `db:seed:community`), `reset.ts` (added the
missing `user_config_unlocks` / `user_objective_progress` drops; `@/src/` -> `~/`),
`tsconfig.json` (removed the seed/reset `exclude` entries, so the seed now
typechecks), `README.md` (documented the logins).

### What it seeds
- 5 playable Supabase auth logins (password `kanto123`), each with a different
  `user_config_unlocks` ledger so each opens on a different build:
  Lt. Surge 40 / Koga 23 / Blaine 13 / Sabrina 12 / Erika 8.
  Archetype pools are derived by predicate on `Config` effect fields, never a
  hardcoded id list — `Config` has no `family` field, so a list would rot.
- 10 community climbers (Lance, Agatha, Lorelei, Bruno, Giovanni, Janine, Bill,
  Daisy Oak, Blue, Prof. Oak) who double as poll authors; 2 fell for gravestones.
- 96 hand-written dev questions, 8 per category across all 12, 51 multiple-answer,
  12 with code blocks, 35 with explanations. Every one published with >=1 correct.
- All 96 into today's `daily_run_polls` — a full 13-gate run in ONE sitting.
- 3 archived runs (victory/dead/abandoned), 150 session responses over 3 gates,
  objective progress counters.

### The one-sitting mechanism (no engine change)
`isAwaitingTomorrow` is only `currentIndex >= polls.length` — there is no date
check in the engine. `getOrCreateDailyRunSeed` returns a persisted sequence
verbatim, so the `SEED_LENGTH = 5` cap only applies when it *generates* a day.
Pre-writing 96 positions bypasses the day lock legitimately.

### Verified
Typecheck 0 errors; lint clean + depcruise 918 modules OK; tests 2 failed /
4290 passed (the documented pre-existing gate-floor baseline). Played in-browser:
login -> hand of 5 -> prep -> 5 polls -> gate 0 PERFECT (+141 KB, swatch, streak)
-> shop (bought .js) -> **gate 1 Boulder prep with polls ready, not "tomorrow"**.
Community board shows standouts, the 13-gate ladder, gravestones and per-poll
splits; Dex shows 5 of 96 polls seen and the 3-run history.

### Deferred
- Single-session only: a run left past local midnight has its unplayed tail
  deleted by `rollSegmentForward`. Re-run `db:seed` the next day.
- Community splits cover the first 3 gates; later gates show sparse data.
- `scripts/polls-d8b3d-firebase-adminsdk-*.json` is a service-account credential
  committed to the repo — should be rotated and removed.
- `schema.ts:346` still imports a type from legacy `src/domains/runs/services/score.service`.
- `supabase/config.toml` `site_url` is :3000 but dev runs on :3005.
