---
# DVTD-s5e9
title: 'Split run.model.ts step 2: move the reducer out (the pivot)'
status: todo
type: task
created_at: 2026-08-25T13:27:18Z
updated_at: 2026-08-25T13:27:18Z
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
