---
# DVTD-7pwh
title: 'Group B: The run write surface hides in a file named queries.ts'
status: todo
type: task
created_at: 2026-08-12T09:11:57Z
updated_at: 2026-08-12T09:11:57Z
parent: DVTD-82c4
---

`applyActionToRun` (`api/queries.ts:574-639`) is the best abstraction in the
codebase: one transaction, `SELECT ... FOR UPDATE`, `hydrateRunState` ->
`runReducer` -> write back, covering all 17 action types with a no-op contract
(`if (next === state) return state`). Nothing outside `run.model.ts` recomputes
coverage or storage. That part is right and should not change.

The problem is where it lives: a 639-line file named `queries.ts` that also
holds the pure reads and seven other writers (`createSessionRunWithState:313`,
`ensureTodaysSegmentWith:359`, `recordSessionAnswer:442`, `finishSessionRun:474`,
`abandonSessionRun:517`, `awardGateSwatch:293`). The name says reads. An agent
asked "where does a run change" must read all 639 lines.

Two specifics:
- Storage credit is duplicated: `finishSessionRun:496-508` and `abandonSessionRun:541-553` are near-identical blocks. A change to the economy bridge needs both edits.
- Day rollover is invoked from three places with different transaction semantics, and the "seed must exist before the transaction opens" constraint is a comment at `api/handlers.ts:146-148`, not a type.

Also worth noting while in here: `getOwnedSwatchesHandler:159` is a pure
pass-through across three files with zero logic.

## Todo
- [ ] Split the write/transaction surface out of `queries.ts`
- [ ] Collapse the duplicated storage credit into one call
- [ ] Make the seed-before-transaction ordering structural, not a comment
