---
# DVTD-929w
title: Drop the old game's tables and legacy columns
status: todo
type: task
created_at: 2026-09-22T18:49:14Z
updated_at: 2026-09-22T18:49:14Z
parent: DVTD-82c4
---

Split out of DVTD-7tof, which was scrapped as mostly-done-elsewhere. This is the part of
it that never happened and still matters.

`src/routes/old/` is **gone** (deleted in `1cbe58ee`), so the tables that served only the
old flow are now inert — nothing reads them. They are still declared in
`src/database/schema.ts`, verified present 2026-09-22:

| table | line |
| --- | --- |
| `daily_polls` | 230 |
| `polls_history` | 248 |
| `run_category_coverage` | 584 |
| `seasons` | 627 |
| `leaderboard` | 652 |
| `run_shop_offerings` | 686 |
| `daily_exposed_deck` | 718 |

`run_category_coverage` is the clearest case: the new engine keeps coverage in
`run_states`.

Also in scope: **legacy columns on live tables**. `users`/`runs` carry old-game fields
(`active_config_ids`, `pipeline_slots`, `pipeline_slot_snapshots`,
`pending_upgrade_cards`, `shop_skipped_date`, `shop_interacted_date`, …). Audit
`schema.ts` for old-flow-only columns and drop them with the tables.

**Shared tables that STAY** (both games use them): `polls`, `polls_options`,
`polls_categories`, `polls_responses`, `polls_response_options`, `runs`, `users`.

## How

Per ADR-012, this is a guarded migration, not a `db:push`:

1. Edit `schema.ts`
2. `npm run db:push` locally
3. Add a guarded SQL file `supabase/migrations/YYYYMMDDHHMMSS_drop_old_game_tables.sql`
4. CI applies it to production on merge

A drop is irreversible, so confirm the production row counts before writing the migration.

- [ ] Audit `schema.ts` for old-flow-only columns on `users`/`runs`
- [ ] Check production row counts on all 7 tables before dropping
- [ ] Drop the 7 tables and the legacy columns in one guarded migration
