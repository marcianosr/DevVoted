---
# DVTD-hsus
title: What a gate close previews is what it does
status: completed
type: task
priority: normal
created_at: 2026-10-01T18:34:29Z
updated_at: 2026-10-01T18:56:42Z
parent: DVTD-y3vn
---

**What:** The prep and poll screens preview a gate close by asking the same rules the close itself runs.

**Why:** The previews copied parts of the close and already disagree with it: a retried gate's peel is understated, a mirrored poll's credit is counted wrong, and Dry Run promises a clear against a different line.

## Done when
- [x] On a retried gate, the stake's peel and fatality match what a miss would take
- [x] Under a mirror audit, the stake's accuracy credit matches what the close counts
- [x] Dry Run's clear promise uses the close's own ruling (estimate units, flawless floor, the gate's clearing band)
- [x] The gate close lives in its own module, apart from answer grading
- [x] Lint, typecheck and tests pass

## Notes
Candidate 1 of the 2026-10-01 deepening pass. Stake: runView.viewmodel failPeelQuotaFor without gateAttempts; gateStake.viewmodel windowAheadFor/accuracyViewFor credit the unmirrored poll; gateProjectionFor clears at ladder.healthy and omits estimateUnits and the flawless floor. closeWindow in answer.model is the real close. Dry Run's projection is still rendered by nothing (ADR-123).

## Summary of Changes

closeWindow moved out of answer.model into run/domain/gateClose.model.ts as settleGate. New shared rules there: missPeelFor (peel with retry attempts, used by the close and the stake), gateProjectionFor (builds the close the gate would rule for a right and a wrong next answer, asks gateRulingFor; demand is clearingLineAt). pollCreditFor in answer.model mirrors before crediting; the reducer and the stake both call it. gate.model lost its hand-rolled projection and gained clearingLineAt. ADR-168, CONTEXT.md rows. Tests: gateStake.viewmodel.spec (stake vs close on a retry and a mirror, both red first), gateClose.model.spec (projection agrees with the ruling, keeps an early promise, peel escalates).
