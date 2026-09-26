---
# DVTD-z7yf
title: Game over screen
status: completed
type: feature
priority: normal
created_at: 2026-07-13T08:23:53Z
updated_at: 2026-07-24T13:41:58Z
parent: DVTD-u35m
---

Dedicated end-of-run screen when the pipeline breaks (dead): final stats (gates climbed, coverage, storage), run summary, and restart/next-day CTA. Currently reuses RunSummary; give it a proper 'game over' treatment.

## Summary of Changes

Gave the live end-of-run screen (`presentation/run/RunSummary.ui.tsx`, rendered by RunGame + proto-run) a proper game-over treatment using the shared `StatusLine` primitive.

- New pure model `gate/gateLadder.model.ts` — `deriveGateLadder(gatesCleared, won, victoryGate)` returns one `{gate, status}` per gate (pass = cleared, fail = stall gate on a lost run, skip = not reached). Unit-tested (4 cases).
- `RunSummary.ui.tsx` now renders: outcome banner (kept) → "Pipeline run" summary line ("N cleared · stalled at gate M" / "summit reached") → a `StatusLine` row per gate (full ladder, all VICTORY_GATE gates) → a green totals footer ("+{storage}KB storage · +{coverage}% coverage"). Dropped the 3 StatBadges (subsumed by the ladder + footer).
- Added required `victoryGate` prop; wired both call sites (`RunGame`, `proto-run`) with `view.victoryGate`.
- Updated spec (asserts summit-all-cleared + dead-stall-location) and story (Summited / RunOver / StalledAtFirstGate).

Verify: 6 specs green, `tsc --noEmit` clean on touched files, `oxlint` + dependency-cruiser clean.

Note: `presentation/screens/GameOverScreen.ui.tsx` is dead code (never wired) — candidate for deletion in a follow-up.
