---
# DVTD-xj95
title: Per-gate objectives, and the mispriced band table
status: completed
type: feature
priority: high
created_at: 2026-09-14T13:16:00Z
updated_at: 2026-09-14T15:07:15Z
---

Plan: ~/.claude-work/plans/funny-thing-there-is-nested-moore.md

Prep's objectives panel gains an authored third row per gate, the clear row stops
naming a band the gate does not draw, and two bugs found on the way get fixed.

## Todo

- [x] Step 0: coverageGainPercentFor — the gain is units, not a percent
- [x] Step 1: coverageRungsFor / clearingRungFor — one derivation for badge + table
- [x] Step 2: answersOwedFor — the clear row prices itself in answers
- [x] Step 3: Objective.requirements list + lost mark
- [x] Step 4: gateObjective.model.ts — 13 authored objectives, pure over AnswerOutcome[]
- [x] Step 4b: answeredThisGate replaces the allAnswered position slice (retry bug)
- [x] Step 5: OBJECTIVE_BONUS 1.15 funded by GATE_REWARD_KB 32 -> 28; route PERFECT_BONUS
- [x] Step 6: forward disclosure — name gate N's objective on gate N-1's outcome
- [x] Step 7: ScoringRule copy — state the ladder, not two samples
- [x] ADR + wiki 2.8/7 + CONTEXT.md + CHANGELOG
- [x] Follow-up beans: floor rule, GateStakeReceipt percent, tooltip clip, DVTD-wra4

## Summary of Changes

**The reported bug.** `CLEARING_BAND = "ok"` was a module constant while `bandOutcomesFor` computed the same collapse test independently. Both now read `coverageRungsFor(ladder)` / `clearingRungFor(ladder)` over the live *audited* ladder, so gate 0 badges HEALTHY and an audit that squeezes OK out promotes the badge by itself. `met` moved onto the same rounded rung, since `coverageBandOf` compares against the unrounded ladder and could disagree at a boundary.

**Two bugs found on the way.** (1) `PrepView` read `percentOf(coveragePerCorrect)` where that value is in units, so the frame carried 300 at gate 4 against a true 12, and the table quoted HEALTHY and OK the same KB at nearly every gate; `coverageGainPercentFor(units, gate)` fixes it. (2) `rightAnswersPerGate` sliced the append-only record by position, which a retried gate breaks — `answeredThisGate` (ordered, reset on `finish-reward`) is now the source, which also feeds the roster.

**Gate objectives (ADR-082).** 13 authored entries in `gateObjective.model.ts`, pure over `readonly AnswerOutcome[]`. Three families on three dials, easing at every gate where the audit load steps. A bonus, never a demand — asserted by an exhaustive 13 x 3^5 monotonicity property, which is what cut a "back to green" shape. Pays x1.15 on the clear, funded by `GATE_REWARD_KB` 32 -> 28. The next gate's objective is named on the previous gate's debrief.

**UI.** `Objective.requirement` became `requirements[]`, so the clear row reads `reach OK · answer 2 of 5`, drops the price once met, and reads `even 5 of 5 falls short` where five cannot reach the line. Added `lost` and a struck mark, because 10 of 13 objectives can settle short mid-window.

**Popover.** `ScoringRule` states the quarter/half/three-quarter ladder instead of two samples of it, including the quarter rung, the cancelled-answer rule, and that a partial does not move the correct tally.

## Deviations from the plan

- **PERFECT_BONUS not routed.** The plan asked for it in the same pass to avoid two bonus rows on one ledger. `GateOutcomeView` hardcodes `bonusKb: 0`, so that panel never renders and nothing lies today. Left alone and recorded in ADR-082's consequences rather than moving the economy twice.
- **The per-gate score track still mis-slices after a retry.** Fixing `pollScoresFor` needs per-gate history the run does not keep. Only `correctThisGate` moved onto the honest source.
- **wiki 2.8's coverage and payout columns corrected.** Listed as out of scope, but 32 -> 28 made the payout column wrong, and the table is not credible with one column right and one stale.

## Not validated

`OBJECTIVE_BONUS = 1.15` and `GATE_REWARD_KB = 28` are arithmetic, not balance. The repo's only simulation models coverage win rates, not KB, so it cannot see this change. The bonus also rides the flat config payouts folded into `gateClearPayout` (Unit Tests, AGENTS.md), which is the one place the "never compound with config-specific income" rule bends.

## Verified

`npm run build` clean, `npm run lint` clean, depcruise clean. 4396 tests: 2 failing, both `gate.model.spec.ts`'s floor rule, red before this work and now beaned as DVTD-xl63.

## Partly reversed

The per-gate objective roster and ADR-082 were parked the same day by
[[DVTD-a2ng]], which holds the ADR text and the model file verbatim. The band
table fixes from this bean (honest per-band payouts, HEALTHY at gate 0, the
answers-owed line) all stand.
