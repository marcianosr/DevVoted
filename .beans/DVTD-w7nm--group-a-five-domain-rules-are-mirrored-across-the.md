---
# DVTD-w7nm
title: 'Group A: Five domain rules are mirrored across the API seam'
status: completed
type: task
priority: high
created_at: 2026-08-12T09:11:30Z
updated_at: 2026-08-13T09:15:02Z
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
- [x] Unify `answerOutcome` / `outcomeOf`
- [x] Make `Effect.faucetPerCorrect` the only faucet sum, or delete the field
- [x] Share the coverage-config predicate
- [x] Share `nextStreak` with `longestCorrectStreak`
- [x] Keep the SQL position, but add a test asserting it agrees with `trackPosition`

## Summary of Changes

All five mirrored rules now have exactly one implementation. Verified by grep:
each rule's name resolves to a single `export const` plus its call sites.

| Rule | Now |
|---|---|
| Answer outcome | `run.model.ts:139` `answerOutcome`, generic over id type; community calls it at 4 sites |
| Coverage-config predicate | `effect.model.ts:89` `touchesCoverage`; `gateReward.model.ts` imports it |
| Correct-answer streak | `run.model.ts:153` `nextStreak`; `standouts.model.ts:291` folds with it |
| Faucet income | `config.model.ts:114` `faucetKbPerCorrect`; 4 open-coded sums replaced |
| Climb track position | `climbMap.model.ts:26` `trackPosition`; SQL copy kept, pinned by a test |

### How the answerOutcome blocker dissolved

The bean recorded this as blocked on the engine using string option ids and the
community board using numeric DB ids. That was not a real obstacle: the grading
rule only ever compares ids for *equality*, never orders or arithmetics them. So
the rule is generic over the id type and takes an `Iterable<Id>`, and both sides
feed it their own ids unchanged. No DTO, no id-mapping layer, no shape
negotiation.

Unifying it also fixed a live divergence. On a `single` poll that has more than
one correct option, the community copy graded a pick "wrong" where the engine
graded it "correct". `run.model.spec.ts:1639` now pins the two readings together
with four parameterised agreement cases.

### The faucet field

`Effect.faucetPerCorrect` was deleted rather than made canonical. It was written
at one site and read at none, while the sum it was meant to own was open-coded
four times. `faucetKbPerCorrect(configs)` is now the only way to ask.

### Deliberately left as a mirror

`climbers.repository.ts:22` still computes track position in SQL. Reimplementing
it in TypeScript would mean loading every climber to sort them, so the copy earns
its place. `climbMap.model.spec.ts:55` asserts the two agree, and the comment now
points at that test instead of merely admitting the duplication.

### Found but out of scope

A sixth mirror, not in this bean's table: `RunConfigure.component.tsx:17` guards
the Start button with `slots - configs.length <= 0`, mirroring the engine's own
refusal at `run.model.ts:916`. Two lines, low risk, but the same shape as the
five above. Filed separately rather than folded in.
