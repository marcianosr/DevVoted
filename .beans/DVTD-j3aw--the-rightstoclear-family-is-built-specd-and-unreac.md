---
# DVTD-j3aw
title: The rightsToClear family is built, spec'd and unreachable
status: todo
type: task
priority: low
created_at: 2026-09-14T15:47:35Z
updated_at: 2026-09-14T15:47:35Z
---

`rightsToClear`, `rightsToSurvive`, `rightsToFill`, `readCoverage`, `isRunUnwinnable`, `maxReachableFrom`, `multiplierToClear`, `multiplierToSurvive`, `coverageAfter`, `coveredSlotsOf`, `payoutRatioFor`, `clearsBar` and `survivesGate` in `coverageRatio.model.ts` have specs and no production caller.

Two things worth deciding rather than just deleting:

- `rightsToClear` is misnamed: it reads `clearsBar`, which is the HEALTHY line, while ADR-076 clears at OK. Anything wiring it up today would quote the wrong number.
- `isRunUnwinnable` exists to catch exactly the gate-9 git-tag rescue (ADR-036), where `createRun` sets `bankedUnits: 0` against a 37.5-unit demand. It is never called, so that run is silently unwinnable.

DVTD-65yi used `answersOwedFor` from `bandOutcomes.viewmodel.ts` instead, which is the same idea living in the application layer.

## Todo

- [ ] Decide: wire up, rename, or delete
- [ ] `isRunUnwinnable` and the rescue run is the one with real consequences
