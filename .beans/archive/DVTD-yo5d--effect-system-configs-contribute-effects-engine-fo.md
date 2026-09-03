---
# DVTD-yo5d
title: 'Effect system: configs contribute effects, engine folds them'
status: completed
type: feature
priority: normal
created_at: 2026-07-12T09:06:19Z
updated_at: 2026-07-12T09:11:24Z
parent: DVTD-5jpw
---

Refactor scattered config-effect handling (hasLinter, disabledOptionIds, requirementDelta folds, check-kind branches) into a single Effect abstraction. Each config maps to an Effect (effectOf) in ONE place; gate/pipeline fold hooks generically (requirement, reward, coverage, faucet, gateCheck, demand, maskWrong). Adding an effect touches only effectOf. Open/Closed. Fully tested.

## Summary of Changes
Introduced an Effect abstraction so config behaviour lives in ONE place (configs/effect.ts → effectOf) and the engine folds hooks generically.
- Effect hooks: requirementDelta, locksBar, rewardMultiplier, faucetPerCorrect, coverage(category), maskWrongOn(category), gateCheck(ctx), demand(gatesCleared).
- pipeline/ folds requirement/reward/coverage/mask; hasLinter → canLint (generic: any maskWrongOn). gate/ folds gateCheck/demand — no more per-check-kind branches.
- Added rules.ts (SLICE_WINDOW, CLIMB_BASE_REQUIREMENT, VICTORY_GATE, SPEED_MS, escalation, dropCount); moved GateWindow/CheckStatus to configs/effect.ts to break cycles.
- Adding a new effect now touches only effectOf (+ maybe a Config field). Consumers never change.
- 49 tests (10 new in effect.spec.ts), tsc + oxlint clean.
