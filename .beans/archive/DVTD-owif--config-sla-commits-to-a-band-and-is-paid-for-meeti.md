---
# DVTD-owif
title: 'Config: SLA commits to a band and is paid for meeting it'
status: completed
type: feature
priority: normal
created_at: 2026-09-22T06:42:18Z
updated_at: 2026-09-22T07:05:32Z
parent: DVTD-72d9
---

Before a gate, name OK, HEALTHY or PERFECT. Close in that band or better and the gate's
KB payout rises 10% / 25% / 50%. Miss it and the uplift simply does not pay.

## Decisions (2026-09-21 session, Marciano)

- **A breach costs nothing.** A floor, not a bullseye — ADR-085's reasoning. The choice is
  still real: committing PERFECT and landing HEALTHY pays nothing where OK would have paid
  10%.
- **The uplift reads the COMMITTED band, not the achieved one.** Otherwise the commitment
  is free and the optimal play is always to commit OK.
- **The base is `clearKb` whole**, including the flat `storageOnClear` grants inside
  `gateClearPayout`. It is the figure the prep band table already prints per band, so the
  uplift is a percentage of a number the player was already shown.
- **It settles AFTER `gateClosingFor`**, unlike Planning Poker's estimate, which settles
  before so it can lift a gate over its own line. SLA is a function *of* the band.

## The finding that reshapes it

The band -> payout slope **does not exist in the engine**. `gateClearPayout` scales by raw
correct-count and never sees a band; `payoutRatioFor`, `gatePayoutKb` and `perfectBonusFor`
are reachable only from `src/test/kantoGate.factory.ts` and their own specs. OK, HEALTHY
and PERFECT pay identical KB today.

So SLA is the FIRST thing in the game making a better clearing band pay more. Wiring the
base slope is a separate, much larger balance change (see the sibling bean).

## Todo

- [x] `meetsBand` predicate + `CommittableBand` in coverageRatio.model.ts
- [x] `Config.commitsBand` + `SLA_UPLIFT` ladder (in coverageRatio.model.ts, not rules: rules is already upstream of it)
- [x] `RunState.slaBand` + `slaUpliftKb` receipt
- [x] `sla.model.ts` + `isPrepPhase` extracted from `canEstimate`
- [x] `commit-band` action + zod arm
- [x] Settle in closeWindow; clear on all four exits + resumeClimb
- [x] SlaControl -> slaPickerFor -> SlaPicker.ui + handler chain
- [x] Gate debrief ledger row
- [x] Roster entry, CONFIG_UNLOCKS + `slas-met` metric, cast.ts
- [x] Specs
- [x] ADR-096 (092-095 were taken by a parallel session), wiki, CHANGELOG

## Summary of Changes

Built 2026-09-22 as **ADR-096** (092-095 were claimed by a parallel session mid-build).

### Two deviations from the plan

- **The uplift ladder lives in `coverageRatio.model.ts`, not `rules.model.ts`.** The plan put
  it beside `FAUCET_CAP_KB`, but `coverageRatio` already imports `rules`, so keying a constant
  in `rules` by `CommittableBand` would have inverted that edge. The bands' own file owns the
  ladder that names them.
- **`meetsBand` was extracted rather than written.** `atLeastBand` was already this comparison
  — it just returned a clamped band instead of a boolean, so only the clamp was reachable.
  `atLeastBand` is now expressed in terms of the predicate.

### Shape as built

- `CommittableBand` narrows the three promisable bands, so SHAKY and DANGER are
  unrepresentable rather than merely refused.
- `RunState.slaBand` (live) + `slaUpliftKb` (receipt); `sla.model.ts` mirrors
  `estimate.model.ts`; `isPrepPhase` lifted to `run.model.ts` and shared with `canEstimate`.
- Settles in the cleared branch **after** `gateRulingFor`, unlike the estimate which settles
  before so it can move the band. Dropped unpaid on every other exit.
- `commit-band` action + zod arm (the exhaustiveness asserts made the arm mandatory).
- `SlaControl` → `slaPickerFor` → new `SlaPicker.ui.tsx`, in prep's left column under the
  band table it commits to. Gate debrief gains an `agreement met` row.
- Unlock `perfect-windows` 10 + a new `slas-met` metric in `clearMetrics` (it cannot live in
  `answerMetrics`: the band does not exist until the close).
- 13 domain specs + 6 settlement specs + 4 `meetsBand` specs + 3 validation specs + a story.

### The finding that reshaped it

The band→payout slope is unwired: `payoutRatioFor`, `gatePayoutKb` and `perfectBonusFor` are
reachable only from a test factory, so OK, HEALTHY and PERFECT pay identical KB. SLA is
therefore the **first** band→KB slope in the game. Three documents claimed otherwise and were
corrected (ADR-076 D3, ADR-091 D3, wiki 2.6); the wiring itself is **DVTD-tjc7**.

### Verified

3969 passed, 0 failed (217 files). Lint and build clean.
