---
# DVTD-7tof
title: Clean up storybook and old code
status: scrapped
type: task
priority: normal
created_at: 2026-07-21T19:56:09Z
updated_at: 2026-09-22T18:50:48Z
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

## Progress 2026-09-19 — UI kit sweep landed

128 dead UI files deleted (`src/ui/`), verified by import-graph reachability from
`src/routes/**`, not grep.

- **`terminal-theme/`: 75 of 108 files deleted.** The 33 survivors are the community
  screen and its primitives, kept alive by exactly one route
  (`/run/community` → `RunCommunity.component.tsx`).
- **`old-theme/` + `modern-theme/`: 53 files deleted.** Survivors are the app shell
  (`__root.tsx`, the three `src/components/*UI` twins, `/stats`, auth/profile
  typography) and the single `modern-theme` thread from `RunStart.component.tsx`.

**Three straddler stories edited rather than deleted** — each tested a live
component *and* a dead one, so deleting would have dropped live coverage:
`terminal-theme/Tooltip.stories.tsx` (dropped `IconButton`),
`terminal-theme/Section.stories.tsx` (dropped `Row`),
`old-theme/modern-theme/Tooltip.stories.tsx` (dropped `Mark`).

**Gotcha worth keeping:** `terminal-theme/stories.smoke.spec.tsx` renders every
story in its folder via `import.meta.glob`. It is the only glob-based spec in the
repo and it is why dead stories kept passing. It survives and still smoke-tests the
remaining stories. Also: `tsconfig.json` excludes `**/*.stories.tsx`, so a story
carried a broken import (`~/ui/theme/swatchTheme`, moved under `old-theme/` by the
quarantine rename) past both tsc and oxlint — it died with the sweep.

## Held back — needs your call

The kanto `Modal` / `Confirm` / `Uninstall` cluster (11 files) is unreachable but is
**designed, working UI**, not rot: `uninstallFor` computes a real refund, slots
freed and balance, and `ShopScreen.stories.tsx` demos the whole flow. Deleting it
would silently remove the uninstall affordance from the kit. Left in place pending
review, alongside the parked gate models.

## Stale note cleared

The 2026-07-25 note above refers to `src/routes/old/` — that folder is gone. Its
leftover `.oxlintrc.json` override was removed under DVTD-4jbz.

## Reasons for Scrapping

Scrapped 2026-09-22 after auditing every box against the code. This bean is a 2026-07
generic cleanup list that reality overtook: its 13 boxes were all still unchecked while
most of the work had already landed under other beans, so it read as 0% done when it was
nearly finished.

**Its first six boxes are generic and now belong elsewhere.** "Audit and remove unused
Storybook stories", "Remove dead code and unused utilities", "Clean up old domains/ code"
and so on were done, or are owned, by:

- **DVTD-4jbz** (completed) — unused deps, stale configs, the ADR bookkeeping.
- **DVTD-9qyd** (in progress) — the `src/domains/` deletions, and the three items that
  genuinely remain there.
- This bean's own 2026-09-19 sweep — 128 dead UI files deleted from `src/ui/`, verified by
  import-graph reachability rather than grep.

**Its 2026-07-25 note is fully stale.** `src/routes/old/` no longer exists (deleted in
`1cbe58ee`), and its leftover `.oxlintrc.json` override went under DVTD-4jbz.

**The two things that genuinely survived are now named beans**, with the evidence
attached rather than a checkbox:

- **DVTD-929w** — the 7 legacy tables are all still in `schema.ts` (`daily_polls:230`,
  `polls_history:248`, `run_category_coverage:584`, `seasons:627`, `leaderboard:652`,
  `run_shop_offerings:686`, `daily_exposed_deck:718`) plus the legacy columns on
  `users`/`runs`. It is a guarded ADR-012 migration, not a cleanup chore.
- **DVTD-ea7h** — the kanto Modal/Confirm/Uninstall cluster. Decided: **wire it into the
  shop** rather than delete it. Confirmed unreachable from `src/routes/**`; production
  `ShopScreen.ui.tsx` has no `onUninstall` prop, so the flow exists only inside
  `ShopScreen.stories.tsx:28-82`. The bean also records the refund discrepancy to settle
  first — the factory uses `sellRefund`, the shop prices everything else via
  `sellRefundIn`.

**One gotcha worth not losing**, recorded here and still true:
`terminal-theme/stories.smoke.spec.tsx` renders every story in its folder via
`import.meta.glob`. It is the only glob-based spec in the repo and it is why dead stories
kept passing. Related: `tsconfig.json` excludes `**/*.stories.tsx`, so a story can carry a
broken import past both `tsc` and oxlint.
