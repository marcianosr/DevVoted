---
# DVTD-xg62
title: 'One predicate per gated action: Rebuild, Lock, Extend, width demand'
status: completed
type: task
priority: normal
created_at: 2026-08-13T13:45:01Z
updated_at: 2026-08-13T15:13:01Z
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

- [x] Export `canRebuild`, `lockAvailable`, `canLock`, `extendAvailable`, `canExtend` from `run/domain`; reducer and viewmodel both call them
- [x] Export `atMinimumWidth` from `rules.model`; the view answers it, both UI copies deleted
- [x] One `widthRefusal` sentence for the two removal surfaces; the other two sites are a different message
- [x] Assert view and reducer together, the way `z1ij` did for `canStart`

## Summary of Changes

### Each gated action is now one predicate

`run/domain/run.model.ts` exports five, following the `canStart`/`canRunLinter` precedent it already had. The reducer guards call them and the viewmodel calls them, so a button cannot offer what the reducer refuses:

| Predicate | Was |
|---|---|
| `canRebuild` | `rebuildDraft` guard + `canRebuild` view flag |
| `lockAvailable` / `canLock` | `lockOffer`'s four-clause guard + two view flags |
| `extendAvailable` / `canExtend` | `extendOffers`' three-clause guard + two view flags |

The `{name}Available` vs `can{Name}` split is kept deliberately and documented: the shop **hides** a control this depth of climb does not sell yet and **disables** one the run cannot pay for, so collapsing them into one flag would lose a real distinction. `lockOffer`'s per-offer clause (`!offer || locked.includes(id)`) stays in the reducer — it is per-config, not a state-level flag, and the view answers it from `lockedOfferIds`.

**Proof the restatement is gone:** `runView.viewmodel.ts` no longer imports `LOCK_FROM_GATE`, `MAX_LOCKED_OFFERS`, `EXTEND_FROM_GATE` or `MAX_EXTENSIONS` at all. It had been reaching for the same four constants the reducer used, to say the same thing a second time.

### The width demand was already written once — privately

`run.model.ts` had a **private** `atMinimumWidth(state)` doing exactly what `ShopScreen.ui.tsx:251` and `PrepScreen.ui.tsx:36` each re-implemented by hand. The rule moved to `rules.model.ts` beside `minConfigsForGate` and `isStakeFatal`, taking `(configCount, minConfigs)`.

`RunView.atMinimumWidth` now answers it once, and both screens read the flag instead of recomputing — `grep "Math.max(1, minConfigs"` returns nothing outside the rule itself. Note it is genuinely distinct from the existing `underMinConfigs`: that one means the build is *already* under the demand, this one means it is *on the floor*, so the next removal would breach it.

### One refusal sentence, two verbs

`widthRefusal(gateNumber, minConfigs, verb)` in `GateStakeReceipt.ui.tsx` (which already owned the width-demand wording via `WidthDemand`). The verb stays per-surface — you uninstall in the shop, you drop at the gate door — but the sentence is written once.

This caught a real copy bug: **ShopScreen said "uninstalling" in one branch and "deinstalling" in the other**, while its own button reads "Uninstall". Unified to "uninstalling"; one spec assertion followed. The other two width-demand strings (`WidthDemand`, `shopExitAction`) were left alone — they are a different message ("you are under the demand, install N more"), not a fourth copy of this one.

### Tests

New `describe("the shop's controls answer to the reducer")` in `runView.viewmodel.spec.ts` — four tests that assert the view flag and the reducer outcome **in the same test**, for rebuild, lock, extend and the width floor. **Mutation-checked**: replacing `canExtend` with `() => true` fails two tests, so the guard is real rather than decorative. New `describe("atMinimumWidth")` in `rules.model.spec.ts` pins the floor-of-1 that keeps a pipeline from ever emptying (ADR-021).

The screen specs now take `atMinimumWidth` as a prop, which is the honest contract for a Tier-1 component: given the flag, refuse the removal. The rule that produces it is tested in the domain.

Verified: tsc 0 errors, oxlint clean, depcruise 0 violations (536 modules), **1480 tests passing** (was 1474; +6 new). Uncommitted per house rule.

### Pre-existing, untouched

`RunCommunity.stories.tsx` (`standouts`) and `RoleList.stories.tsx` (`claim`) fail a stories-only typecheck. Neither file is in this diff; stories are excluded from `tsconfig.json`, so these are invisible to `npm run build`. Worth a separate bean.
