---
# DVTD-s5e9
title: 'Split run.model.ts step 2: move the reducer out (the pivot)'
status: completed
type: task
priority: normal
created_at: 2026-08-25T13:27:18Z
updated_at: 2026-08-25T15:08:31Z
---

Follow-up to DVTD-hg7v. Blocked on nothing, but it is the gating step for every remaining extraction.

## The problem

run.model.ts is simultaneously the BOTTOM of the run-domain graph (it owns RunState and the module-private state-edit primitives every transition needs: withLog, withPipeline, addStorage, freshWindow, widened, chargeStorageBill, shopDraft, stayReward) and the TOP of it (runReducer calls every transition).

Any split that leaves both roles in one file produces a runtime cycle. So the refactor is an inversion, not a partition: run.model.ts keeps the bottom role, runReducer moves up into a new file.

## Cycle rule is stricter than it looks

`no-circular-runtime` is severity error. `#getCycle` (node_modules/dependency-cruiser/src/graph-utl/indexed-module-graph.mjs:192) filters by visited-set alone and NEVER by dependency type. `dependencyTypesNot: ["type-only"]` excuses only the edge being evaluated, not the path home.

So `A --type-only--> B --runtime--> A` still errors on B->A. A type-only back-edge is NOT an escape hatch. Verified by reading the source.

## Shape

Proposed rank order (every edge must point strictly downward):

0. rules.model (imports nothing), pipeline/config/gate/shop domain files
1. runPoll.model  (done, DVTD-hg7v)
2. run.model      -> RunState/RunStatus/AnsweredPoll types, createRun, the cluster-C primitives, the audit lens (auditsOf/liveConfigsOf/offlineConfigsOf/offlinePairsOf), shopDraft
3. answer.model, paidAction.model, strip.model, shopVisit.model, shopControl.model  (must never import each other)
4. runAction.model -> RunAction, SHOP_WRITES, isShopLocked, slot/unslot/pickStack/start, runReducer

Cost to name up front: ~7 previously-private helpers become module-public. There is no way to avoid this without a cycle.

## Todo
- [ ] Decide whether to land steps 2-7 as one commit or a sequence (a sequence needs ~15 transitions temporarily exported from run.model.ts, consumed only by runAction.model.ts)
- [ ] Extract runAction.model.ts, export withPipeline/auditsOf/canStart
- [ ] Verify lint:arch stays clean at each step
- [ ] CONTEXT.md rows per new file

## Notes
- `shopVisit` is a new vocabulary word and needs a CONTEXT.md entry, or a better name. `answer`, `paidAction`, `strip`, `shopControl` are all already blessed vocabulary.
- CONTEXT.md:47 has a stale pointer to fix when paidAction lands: "Lint | pipeline/domain | ... the fee is lintCost in run/domain/run.model.ts".
- Do the whole sequence on one branch: run.model.spec.ts is a merge-conflict magnet.

## Summary of Changes

The inversion landed. `run.model.ts` 1131 -> 229 lines; it now holds `RunState`, `createRun`, the shared primitives and the audit lens, and no transitions or reducer at all.

### New files in run/run/domain

| file | lines |
|---|---|
| answer.model.ts | 369 |
| shopAction.model.ts | 305 |
| runAction.model.ts | 163 |
| paidAction.model.ts | 85 |
| strip.model.ts | 68 |
| run.factory.ts | 115 |

Spec split to match: run.model.spec.ts (2386) -> runAction.model.spec.ts 499, answer 880, shopAction 605, strip 151, paidAction 150, run 91.

### Rank order (acyclicity proof)

```
0  rules.model, pipeline, config/*, gate/*, shop/draft
1  runPoll.model
2  run.model                     the bottom
3  answer, shopAction, paidAction, strip   (never import each other)
4  runAction.model               the top
```

Verified both invariants: no rank-3 file imports another rank-3 file, and every moved symbol is declared exactly once.

### Verification

- `npm run lint`: clean, `lint:arch` 757 modules / 3066 dependencies, no violations.
- `npm run build`: clean, 0 tsc errors.
- `npm test`: 2333 total, 2322 passed, unchanged from before the refactor. The 3 failures in `src/ui/modern-theme/screens/RewardScreen.spec.tsx` are pre-existing (reproduced on HEAD in a worktree during step 1).

### Incident during the spec split

The write loop created the new small `run.model.spec.ts` BEFORE `git mv run.model.spec.ts runAction.model.spec.ts`, clobbering the file that still held the six describe blocks meant to stay behind. 35 tests vanished (2333 -> 2298) and the test run stayed green, because a deleted test does not fail.

Caught by comparing the total against the recorded 2333, not by any tooling. Recovered the six blocks verbatim from `git show HEAD:` (their bodies were untouched by steps 1 and 2) and confirmed 191 `it(` and 32 describes restored.

Lesson for the next split: assert the test total after every step, and never write a file whose name is also a `git mv` source in the same pass.

### CONTEXT.md

Rewrote the Run / Climb row and added rows for Run action, Answer / Scoring, Shop action, Paid action, Strip / Peel and Run fixtures. Fixed the stale Lint row, which pointed `lintCost` at `run.model.ts`.
