---
# DVTD-w7nm
title: 'Group A: Five domain rules are mirrored across the API seam'
status: todo
type: task
priority: high
created_at: 2026-08-12T09:11:30Z
updated_at: 2026-08-12T10:21:01Z
parent: DVTD-82c4
---

Five rules are implemented twice on opposite sides of a clean seam. Three carry
a comment admitting the mirror, which is the tell.

| Rule | Engine | Copy |
|---|---|---|
| Answer outcome (correct/partial/wrong) | `climb/run.model.ts:120` | `api/community.handlers.ts:138` ("Mirrors the engine`s answerOutcome") |
| Climb track position | `climb/climbMap.model.ts:26` | `api/climb.queries.ts:22`, in SQL |
| Correct-answer streak | `climb/run.model.ts:132` | `community/standouts.model.ts:289` ("Mirrors the engine`s nextStreak") |
| Faucet income (`storagePerCorrect` sum) | `Effect.faucetPerCorrect` | never read; recomputed at `pipeline.model.ts:148`, `run.model.ts:488`, `gateReward.model.ts:212` and `:148` |
| "Is a coverage config" | `configs/effect.model.ts:105` | `gate/gateReward.model.ts:26`, byte-identical |

The faucet one is the sharpest: the abstraction meant to own it
(`Effect.faucetPerCorrect`, set at `effect.model.ts:131`) is never read
anywhere, and the sum is open-coded four times.

Consequence: a partial-credit rule change needs two edits or the community
board silently disagrees with the run.

Blocker on `answerOutcome`: the community handler works in numeric DB option
ids, the engine in string ids. Unifying needs a shape both can feed.

Previously surfaced in the scrapped DVTD-wz1b ("unify answer-outcome rule
(triplicated)") and never fixed.

## Todo
- [ ] Unify `answerOutcome` / `outcomeOf`
- [x] Make `Effect.faucetPerCorrect` the only faucet sum, or delete the field
- [x] Share the coverage-config predicate
- [x] Share `nextStreak` with `longestCorrectStreak`
- [x] Keep the SQL position, but add a test asserting it agrees with `trackPosition`

