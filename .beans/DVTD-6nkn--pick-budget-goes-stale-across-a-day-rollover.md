---
# DVTD-6nkn
title: Pick budget goes stale across a day rollover
status: completed
type: bug
priority: high
created_at: 2026-08-14T13:50:14Z
updated_at: 2026-08-14T13:53:42Z
---

`.length`'s window.budget is fixed when the window opens, but ADR-011's rollover replaces the unplayed tail with different polls. A player who spreads a gate over several days is shown a budget computed from polls that no longer exist.

## Summary of Changes

`window.budget` is now recomputed in `hydrateRunState` from the polls the window
actually holds, instead of only being set when the window opens.

- `run.model.ts`: new `windowStartIndex(state)` = `currentIndex - window.answered`
  (the two advance one per answer and reset together, so their difference is the
  window's first poll). `pickBudgetFor` doc corrected: it counts the answered
  polls too, and is recomputed rather than stored.
- `runSnapshot.model.ts`: `hydrateRunState` derives the budget. This is the single
  choke point for `loadRunState` and `applyActionToRun`, and it runs *after*
  `rollSegmentForward`, so both read paths are covered. The reducer still sets it
  at window open, so a window that fills inside one session needs no round trip.
- `effect.model.ts`: `budget` field doc updated.
- 5 new tests in `runSnapshot.model.spec.ts`; the `mid-gate answering` variant
  gained a realistic `budget: 3`.
- wiki §4.3 `.length` prose + the CHANGELOG entry (unreleased, so folded in
  rather than logged as a fix).

## Root cause

ADR-011 §2: at the first interaction of a new day the run's unplayed tail is
deleted and today's segment appended. ADR-011 §3: gates are indifferent to day
boundaries, so a window stays open across that swap. `hydrateRunState` carried
`window` verbatim from the snapshot while taking `polls` fresh, so for anyone
pacing slower than 5 polls a day the budget priced deleted polls: unwinnable or
free by luck, and a number shown to the player that was not true (ADR-031).

Only `budget` was exposed. Every other `GateWindow` field is a tally of what
already happened; `budget` was the one forward-looking field.

## Verified

1574 tests pass (120 files), tsc clean, oxlint clean, depcruise clean.
