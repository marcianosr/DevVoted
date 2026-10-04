---
# DVTD-3hcg
title: strip should take a list of configs
status: completed
type: task
priority: critical
created_at: 2026-09-15T14:13:55Z
updated_at: 2026-09-16T10:32:01Z
parent: DVTD-0x5c
blocking:
    - DVTD-iiny
---

The kanto `GateOutcomeView` collects a tick-list and fires `onRemove(configIds)` once. The server takes one action per request, so one press becomes N `strip` requests plus a `resume-climb`, and navigation can only happen after the last lands.

(The wired `RunStrip` sidesteps this by stripping on every click, which is the worse UX.)

- [x] Widen the `strip` action to `configIds: readonly string[]`
- [x] Update `runActionSchema` (the type assertions will catch a mismatch)
- [x] Reducer folds the list, so one press is one transaction
- [x] Spec: a partial peel that overshoots the quota still refunds correctly

## Summary of Changes

`strip` is now `{ type: "strip"; configIds: readonly string[] }`. `strip.model.ts` keeps the single-config step private as `stripOne` and exports `strip` as a fold over it, so the sequence (and therefore the refund pricing, which reads the build each config leaves behind) is unchanged while one press is one transaction.

The overshoot is free: `stripOne` refuses once `peelSlotsRemaining` hits 0, so a player who ticks one config too many keeps it.

Two specs added to `strip.model.spec.ts`: the surplus config survives an overshooting press, and a two-config press settles exactly as two presses would.
