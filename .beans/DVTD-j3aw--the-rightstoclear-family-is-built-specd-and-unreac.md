---
# DVTD-j3aw
title: The rightsToClear family is built, spec'd and unreachable
status: completed
type: task
priority: low
created_at: 2026-09-14T15:47:35Z
updated_at: 2026-09-25T20:01:22Z
---

`rightsToClear`, `rightsToSurvive`, `rightsToFill`, `readCoverage`, `isRunUnwinnable`, `maxReachableFrom`, `multiplierToClear`, `multiplierToSurvive`, `coverageAfter`, `coveredSlotsOf`, `payoutRatioFor`, `clearsBar` and `survivesGate` in `coverageRatio.model.ts` have specs and no production caller.

Two things worth deciding rather than just deleting:

- `rightsToClear` is misnamed: it reads `clearsBar`, which is the HEALTHY line, while ADR-076 clears at OK. Anything wiring it up today would quote the wrong number.
- `isRunUnwinnable` exists to catch exactly the gate-9 git-tag rescue (ADR-036), where `createRun` sets `bankedUnits: 0` against a 37.5-unit demand. It is never called, so that run is silently unwinnable.

DVTD-65yi used `answersOwedFor` from `bandOutcomes.viewmodel.ts` instead, which is the same idea living in the application layer.

## Todo

- [x] Decide: wire up, rename, or delete
- [x] `isRunUnwinnable` and the rescue run is the one with real consequences

## Summary of Changes

Deleted with the answer-payout slice of the deepening pass (DVTD-yifo, 2026-09-25): `rightsToClear`, `rightsToSurvive`, `rightsToFill`, `readCoverage`, `CoverageReading`, `CoveragePeril`, `PERIL_COLOUR`, `isRunUnwinnable`, `maxReachableFrom`, `multiplierToClear`, `multiplierToSurvive`, `coverageAfter`, `coveredSlotsOf`, `clearsBar`, `survivesGate`, plus `gainPerCorrectFor`, `coverageMultiplierFor`, `coverageMultiplierOf`, `focusBonusFor`. Their spec blocks went with them; the Monte-Carlo balance block now prices a unit through `answerPayoutFor`.

`rightsToClear` was deleted rather than renamed: `answersOwedFor` in `bandOutcomes.viewmodel.ts` is the live answer. `isRunUnwinnable` was deleted rather than wired: wiring it declares a run dead at birth, which is a rules change, so the design question moved to DVTD-gc9z. `payoutRatioFor`, `perfectBonusFor` and `gatePayoutKb` stay: they are the subject of DVTD-tjc7.
