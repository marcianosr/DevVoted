---
# DVTD-gf7h
title: 'RunView: prune the dead fields, cluster the survivors'
status: completed
type: task
priority: normal
created_at: 2026-08-13T13:44:30Z
updated_at: 2026-08-13T14:19:25Z
parent: DVTD-82c4
---

Follow-up to **DVTD-z1ij**, which added `modifiers`, `perAnswer`, `canStart` and `isOver` but left the field count and the drilling untouched. Found again by /improve-codebase-architecture on 2026-08-13.

`RunState` has 30 fields; `toRunView` turns them into **61**. Two separate problems.

## Six fields have no reader

Grepped every field outside `runView.viewmodel.ts`, `src/test/runView.factory.ts` and the `proto-*` prototypes:

`coverageGainedThisGate`, `demands`, `passedChecks`, `pollsToGate`, `unlock`, `offerCount` — zero consumers.

They are not free:

- `gainedThisGate` (viewmodel:229-245) is a 17-line helper with a `coverageForAnswer` fallback, feeding only `coverageGainedThisGate`
- `unlockOf` (:247-256) exists only for `unlock`
- `demands` is the only non-prototype caller of `gateDemands`, an exported function in `gate/domain/gate.model.ts`
- **`passedChecks` maps `state.clearedChecks`, a persisted `RunState` field.** The reducer maintains it in `closeWindow` (run.model.ts:443) and clears it in `finishReward` (:812). It is written into `run_states.state` JSON on every gate clear and read by nobody
- `runView.viewmodel.spec.ts:93-94` asserts `view.demands[0]` and `view.pollsToGate` — the dead payload has tests, which is why it reads as alive

## The projection is not passed as a projection

CONTEXT.md calls RunView "the single projection every screen reads". No screen accepts it.

| Screen | props on .ui.tsx | plucked in .component.tsx |
|---|---|---|
| ShopScreen | 34 | 33 (RunShop.component.tsx:40-75) |
| AnsweringScreen | 26 | 21 |
| ConfiguringScreen | 14 | 12 |
| PrepScreen | 12 | 10 |
| RewardScreen | 11 | 9 |
| StripScreen | 8 | 7 |

The gate-stake cluster is the clearest case: `gateNumber`, `pollsPerGate`, `stripsOnFailure`, `minConfigs`, `modifiers`, `perAnswer`, `billKb` are props on Prep, Configuring and Shop **only to reach `GateStakeReceipt`**. 7 of PrepScreen's 12 props exist to forward. ConfiguringScreen renders the receipt twice (:120, :221) with the same cluster.

Cost per rename today: viewmodel, component splat, ui props type, destructure, story, spec fixture — six edits, none a decision. `src/test/runView.factory.ts` exists but the screen specs cannot use it: `ShopScreen.spec.tsx:35-80` hand-builds a lossy 33-key re-typing.

## Todo

- [x] Delete the six dead view fields, `gainedThisGate`, `unlockOf`, and their spec assertions
- [x] Delete `RunState.clearedChecks` and its reducer maintenance; confirm no persisted snapshot needs it
- [x] Un-export `gateDemands` or delete it if nothing else calls it
- [x] Add a `gateStake` sub-projection; `GateStakeReceipt` and the three screens take the object
- [x] Point the screen specs at a shared `createMockGateStake`

## Summary of Changes

### The dead payload is gone

Deleted `coverageGainedThisGate`, `demands`, `passedChecks`, `pollsToGate`, `unlock`, `offerCount` from `RunView`, plus the `gainedThisGate` and `unlockOf` helpers that existed only to fill two of them. **`RunState.clearedChecks` went with them** — a persisted field the reducer maintained in `closeWindow` and cleared in `finishReward` so that a view field nobody read could exist. It is no longer written into `run_states.state`; old rows carry a stray key that hydration ignores.

`gateDemands` in `gate/domain/gate.model.ts` lost its last production caller and was deleted with its spec block. Its plain-language demand list was superseded by the role rows `GateStakeReceipt` renders; the identically-named function in `domains/runs/prototype/sessionRun.ts` is a different one and still feeds `/proto-session-slice`. CONTEXT.md updated in both places that named it.

Two spec assertions went with the dead fields. The `unlock` test ("names the slot coverage is buying, not a gate") had nothing left to assert once the field went, and `offerCount` folded into the extension-pricing test beside it.

### The gate stake travels as one object

New `GateStake` in `runView.viewmodel.ts` carries `gateNumber`, `pollsPerGate`, `stripsOnFailure`, `minConfigs`, `billKb`, `modifiers`, `perAnswer` — reusing the wiki's "stake" (as in `isStakeFatal`, ADR-027), not a coined word. `RunView.gateStake` assembles it once; `GateStakeReceipt` and its three screens take the object.

| | props before | after |
|---|---|---|
| PrepScreen | 12 | **6** |
| ConfiguringScreen | 14 | **10** |
| ShopScreen | 34 | **28** |
| GateStakeReceipt | 14 | **7** |

`RunShop.component` drops from 28 forwarded `view.*` fields to 22, `RunPrep` from 11 to 5, `RunConfigure` from 12 to 8. `RunView` itself goes 61 → 56 fields. Net −19 lines across 22 files.

### Behaviour is unchanged, and that needed checking

`minConfigs` and `billKb` were **optional** on the receipt, and Configuring passed neither — so folding them into a required object risked showing the width demand and storage bill on a screen that never had them. It does not: `status: "configuring"` is assigned in `createRun` alone, so that screen only ever renders at gate 0, where `minConfigsForGate(0)` is 0 (below the `>= 2` render threshold) and the default storage plan bills 0 (below the `> 0` threshold). Both guards in the receipt lost their `!== undefined` half.

### Two fixture bugs the change exposed

- `ConfiguringScreen.spec` had been rendering with `minConfigs: 2`, which gate 0 can never produce. Pinned to 0 with a comment naming why.
- `createMockRunView({ gatesCleared: 1 })` left `gateStake.gateNumber` at 0, because `createMockDataFactory` merges shallowly — the screens read gate 0 while the view claimed gate 1, and two `RunLayout` route tests failed on the gate name. `createMockRunView` is now a thin wrapper that keeps the two in step unless a test passes its own stake.

### Tests

New `describe("the gate stake travels as one object")` in `runView.viewmodel.spec.ts`: one test pins the whole object against the domain rules at gate 4, one asserts it agrees with the flat fields other screens still read, so the duplicated facts cannot drift. New shared `createMockGateStake` in `runView.factory.ts` replaced the hand-built prop bags in the three screen specs and their stories.

Verified: tsc 0 errors, oxlint clean, depcruise 0 violations (536 modules), **1474 tests passing** (was 1472 before the two new ones). Stories typechecked separately since tsconfig excludes them. Uncommitted per house rule.
