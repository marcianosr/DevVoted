---
# DVTD-7tof
title: Clean up storybook and old code
status: todo
type: task
priority: normal
created_at: 2026-07-21T19:56:09Z
updated_at: 2026-07-27T14:17:00Z
parent: DVTD-82c4
---

Remove unused stories, deprecated components, and dead code from the codebase

## Cleanup Areas

- [ ] Audit and remove unused Storybook stories
- [ ] Identify deprecated or legacy UI components
- [ ] Remove dead code and unused utilities
- [ ] Clean up old domains/ code that has been migrated to modules/
- [ ] Remove any TODO/FIXME comments that are no longer relevant
- [ ] Verify all components still have tests after cleanup

## Note (2026-07-25): old/ routes parked hard

The 8 legacy route files under src/routes/old/ are now @ts-nocheck (typecheck was blocking commits via husky; Marciano chose ignore-over-fix). Their internal cross-links still use pre-move paths, so navigating WITHIN the old flow 404s at runtime — acceptable, they are deletion candidates. An .oxlintrc.json override (src/routes/old/**, ban-ts-comment off) exists and should be deleted together with the folder. Live code no longer depends on the old flow except: useFinishRun/profile End Run (/old/game-over), DevPollNavigator (/old/daily-poll), DailyPollContainer (/old/pipeline-*). Entry points (/ redirect, auth callback, nav) now point at /run.

## Database: legacy tables die with the old game (2026-07-25)

When src/routes/old/ is deleted, drop the old game's tables in the SAME migration — they serve only the parked flow and are inert until then (do NOT drop earlier, the /old/* pages still read them):

- [ ] `daily_polls` (old daily-poll scheduling)
- [ ] `polls_history`
- [ ] `daily_exposed_deck`
- [ ] `run_category_coverage` (new engine keeps coverage in run_states)
- [ ] `run_shop_offerings`
- [ ] `seasons` + `leaderboard` (new leaderboard is DVTD-1q2y, different shape)
- [ ] Legacy COLUMNS on live tables: `users`/`runs` carry old-game fields (`active_config_ids`, `pipeline_slots`, `pipeline_slot_snapshots`, `pending_upgrade_cards`, `shop_skipped_date`, `shop_interacted_date`, …) — audit schema.ts for old-flow-only columns and drop with the tables.

Shared tables that STAY (both games use them): `polls`, `polls_options`, `polls_categories`, `polls_responses`, `polls_response_options`, `runs`, `users`.
