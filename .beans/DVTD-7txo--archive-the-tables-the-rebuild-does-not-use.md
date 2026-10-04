---
# DVTD-7txo
title: Archive the tables the rebuild does not use
status: draft
type: task
priority: normal
created_at: 2026-09-03T15:00:42Z
updated_at: 2026-09-03T15:00:45Z
blocked_by:
    - DVTD-9qyd
---

The rebuild uses a small subset of `src/database/schema.ts`. Everything else should be renamed with an `_old` suffix and kept for historical reasons (Marciano, 2026-09-03). Deferred until the old app in `src/domains` comes out, since half of it still works.

Blocked by DVTD-9qyd (delete the superseded old-app code).

## Inventory, checked 2026-09-03

Reference counts are files that touch the Drizzle symbol, specs excluded. "live" is `src/modules` + `src/shared` + `src/routes`; "legacy" is `src/domains`.

### Keep, on Marciano's list

| Table | live | legacy | Note |
| --- | --- | --- | --- |
| `users` | 6 | 5 | |
| `polls_categories` | 0 | 2 | FK target only; live code reads `CATEGORY_CODES` from `shared/lib/categories.ts` |
| `polls_options` | 3 | 5 | |
| `polls_responses` | 4 | 5 | |
| `polls_response_options` | 3 | 4 | Marciano's list said `polls_responses_options`; the real name is singular `response` |
| `run_states` | 4 | 0 | |
| `daily_run_polls` | 1 | 0 | |

### Keep, not on the list, but live code queries them

| Table | live | legacy | What needs it |
| --- | --- | --- | --- |
| `polls` | 3 | 6 | The questions themselves; `daily_run_polls` joins it |
| `runs` | 3 | 8 | `finishSessionRun`, `abandonSessionRun` |
| `daily_run_seeds` | 2 | 0 | `getOrCreateDailyRunSeed`, ADR-011 rollover |
| `run_polls` | 2 | 0 | The run's materialised sequence, ADR-011 |
| `polls_history` | 1 | 2 | Only the Dex "times seen" count (`polldex.repository.ts`). The one genuinely optional table on this list: drop that number and it archives cleanly |

### Archive to `_old`, zero live references

| Table | live | legacy |
| --- | --- | --- |
| `daily_polls` | 0 | 1 |
| `run_category_coverage` | 0 | 5 |
| `seasons` | 0 | 0 |
| `leaderboard` | 0 | 1 |
| `run_shop_offerings` | 0 | 1 |
| `daily_exposed_deck` | 0 | 1 |

`seasons` is referenced by nothing at all, in either tree.

## The thing to know before doing it

The rename is source-compatible. `pgTable("leaderboard", ...)` becoming `pgTable("leaderboard_old", ...)` changes the SQL object name and not the TypeScript identifier, so every `src/domains` file importing `leaderboardTable` keeps compiling and keeps working against the renamed table. `_old` is a label, not a fence. If the goal is to stop things using these tables, the rename has to land together with deleting the legacy readers, which is why this waits on DVTD-9qyd.

## Knock-on

`leaderboard` carries `category_coverage` and `total_coverage`, and it is the only existing home for per-category coverage. Archiving it settles an open question on the lifetime-category-mastery work: that track gets a new table rather than reusing this one. `run_category_coverage` is likewise archived, not revived.

## Todo

- [ ] Confirm `polls_history` goes or stays (costs the Dex "times seen")
- [ ] Rename the six in `schema.ts`
- [ ] Guarded migration `supabase/migrations/<ts>_archive_unused_tables.sql`, `ALTER TABLE IF EXISTS <t> RENAME TO <t>_old;` per table (ADR-012)
- [ ] Re-run the reference counts first; the numbers above age as `src/domains` shrinks
