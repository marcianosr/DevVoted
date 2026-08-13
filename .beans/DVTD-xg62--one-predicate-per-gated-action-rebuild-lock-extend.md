---
# DVTD-xg62
title: 'One predicate per gated action: Rebuild, Lock, Extend, width demand'
status: todo
type: task
created_at: 2026-08-13T13:45:01Z
updated_at: 2026-08-13T13:45:01Z
parent: DVTD-82c4
---

`run/domain/run.model.ts` already exports `canStart` and `canRunLinter` with a comment stating the intent: *"Exported so the Start button asks the rule rather than restating it; the reducer refuses either way."* Three shop actions and the width demand never got the same treatment.

## Rebuild / Lock / Extend — reducer guard and view flag, same constants, negated

| Action | Reducer guard | Viewmodel restatement |
|---|---|---|
| rebuild | `rebuildDraft` run.model.ts:825-826 `if (state.storage < cost) return state` | :296-297 `canRebuild: state.storage >= nextRebuildCost` |
| lock | `lockOffer` :838-845 (four clauses: `< LOCK_FROM_GATE`, `locked.includes`, `>= MAX_LOCKED_OFFERS`, `< LOCK_COST_KB`) | :298-301 `lockAvailable`, `canLock` |
| extend | `extendOffers` :858-862 (`< EXTEND_FROM_GATE`, `>= MAX_EXTENSIONS`, `< cost`) | :303-306 `extendAvailable`, `canExtend` |

Both files import the same constants from `shop/domain/draft.model.ts`.

## Width demand — the predicate three times, the wording four times

```ts
// run.model.ts:882 — authoritative, guards sell() and drop()
state.pipeline.configs.length <= Math.max(1, minConfigsForGate(state.gatesCleared))
// ShopScreen.ui.tsx:263
const atMinimumWidth = configs.length <= Math.max(1, minConfigs);
// PrepScreen.ui.tsx:44
const atMinimumWidth = configs.length <= Math.max(1, minConfigs);
```

Player wording, four near-copies: `ShopScreen.ui.tsx:292-295`, `PrepScreen.ui.tsx:48-50`, `GateStakeReceipt.ui.tsx:48-53` (`WidthDemand`), `ShopScreen.ui.tsx:100` (`shopExitAction`).

`RunView.underMinConfigs` already exists (viewmodel:140) and is read only by `shopExitFor` — the two screens that show the rule recompute it instead. The domain evaluates the live pipeline; if `minConfigs` were ever stale in the view, the buttons and the reducer would disagree.

## Todo

- [ ] Export `canRebuild(state)`, `canLock(state)`, `canExtend(state)` from the run or shop domain; reducer and viewmodel both call them
- [ ] Add a `widthDemand` projection `{ met, demand, shortfall }`; delete both UI copies of the predicate
- [ ] Settle on one wording for the demand and use it at all four sites
- [ ] Assert view and reducer together, the way `z1ij` did for `canStart`
