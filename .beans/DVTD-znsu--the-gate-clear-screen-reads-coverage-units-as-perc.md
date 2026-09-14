---
# DVTD-znsu
title: The gate clear screen reads coverage units as percent
status: completed
type: bug
priority: high
created_at: 2026-09-14T15:07:31Z
updated_at: 2026-09-14T15:18:26Z
---

A perfect gate 0 (5 of 5 right) settles at 100% coverage in the engine, but the gate-clear screen prints 20% HEALTHY. Every cleared gate 0 prints 20% regardless of play.

## Root cause

`coverage` crosses the presentation boundary in units and is consumed as percent.

1. `GateOutcomeView.component.tsx` `heldFor` sums `answer.coverage` raw (units) and hands it to a percent-scaled bar.
2. `closedBarFor` clamps a cleared gate up to its OK line (ADR-076). `okAt(0)` collapses onto `healthyAt(0)` = 0.2, so the clamp manufactures 20% + HEALTHY.
3. Same mistake in `gateOutcome.viewmodel.ts` folds and `gateReview.viewmodel.ts`, so the review screen is wrong too.
4. `kantoGate.factory.ts` fixtures were authored in percent, so stories looked right while the live adapter fed units.

## Fix shape

Domain speaks units, kanto kit speaks percent, conversion happens once in `gateAnswersOf`.

## Todo

- [x] `gatePayout.viewmodel.ts`: expose `clearedCoverageHeld`
- [x] `GateOutcomeView.component.tsx`: convert units to percent in `gateAnswersOf`; `heldFor` reads the settled level
- [x] `ReviewView.component.tsx`: pass the gate through
- [x] `gateOutcome.viewmodel.ts`: fold badge = the gate's gain
- [x] Specs: rebase `GateOutcomeView.spec.tsx` fixtures to units; pin the clamp as a no-op; cover `clearedCoverageHeld`
- [x] Docs boyscout: ADR-073 and wiki 2.6 still describe the dead 5%-per-answer model
- [x] Verify: lint, build, tests, and an engine-backed render spec in place of the click-through


## Summary of Changes

`GateAnswer.coverage` now crosses the presentation boundary in **percent**, converted once in `gateAnswersOf(answered, gate)` via the existing `coverageGainPercentFor`. The gate-clear bar reads the settled level from a new `gatePayout.clearedCoverageHeld` (`percentOf(runCoverageOf(bankedUnits, clearedGate))`) rather than summing raw units, so a flawless gate 0 reads 100% PERFECT instead of the manufactured 20% HEALTHY.

Also fixed the review screen (same mix-up, same adapter) and made the By-category badge state the gate's gain so it agrees with its own rows.

### Files

- `src/modules/run/run/application/gatePayout.viewmodel.ts` (+ new spec)
- `src/modules/run/gate/presentation/GateOutcomeView.component.tsx` (+ spec rebased to units, 3 new regression specs)
- `src/modules/run/run/presentation/ReviewView.component.tsx` (+ spec rebased)
- `src/modules/run/gate/application/gateOutcome.viewmodel.ts` (+ new spec pinning the ADR-076 clamp as a no-op on a clear)
- `src/test/runView.factory.ts` (`clearedCoverageHeld` default; its absence made `CoverageBar` loop on NaN)
- `docs/adr/073`, `docs/wiki.md` 2.6 (both still described the dead 5%-per-answer model)

### Verified

lint clean (1 pre-existing warning), `npm run build` clean, 4340 passing. The 2 failures in `gate.model.spec.ts` are the pre-existing unimplemented floor rule (DVTD-xl63), failing identically on a clean tree.

### Deferred

The By-category total's quiet `of {demand}% needed` compares a per-gate gain against a cumulative level threshold. They coincide at gate 0 and drift from gate 1.

ADR-073's title and Decision 4 still say coverage "resets every gate", but `bankedUnits` carries and the denominator grows with `scoringSlotsAt`. Flagged, not rewritten: that is a decision change, not a doc fix.
