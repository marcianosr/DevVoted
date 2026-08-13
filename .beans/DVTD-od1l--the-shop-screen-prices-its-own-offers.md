---
# DVTD-od1l
title: The Shop screen prices its own offers
status: completed
type: task
priority: normal
created_at: 2026-08-13T13:45:01Z
updated_at: 2026-08-13T15:47:57Z
parent: DVTD-82c4
---

`RunView.draftOptions` ships raw roster `Config` objects, so `shop/presentation/ShopScreen.ui.tsx` finishes the pricing itself.

It imports **10 domain functions from four other aggregates**:

```
config/domain/config.model:     describeConfig, draftCost, isUpgradable, sellRefund,
                                upgradeCoverageRequired, upgradeStorageCost
pipeline/domain/pipeline.model: perAnswerPreviewFor, pipelineModifiersFor
gate/domain/configRole.model:   roleRows
gate/domain/swatch.model:       swatchForGate
```

and computes: `canAfford` (:229), `canInstall` (:230), `canUpgrade` (:233-240), `upgradeTooltip` (:242-261), `installRefusal` (:328-333).

Consequences:

- Draft affordability is decided **client-side** while rebuild/lock/extend affordability is decided server-side in the viewmodel — see the sibling bean on duplicated predicates
- The shop's economics are only reachable through `render()`. `runView.viewmodel.spec.ts` already exists and is where these belong
- `ShopScreen.spec.tsx:4-7` imports `draftCost`, `CONFIGS`, `MAX_SLOTS`, `STORAGE_PLANS` to compute its own expectations, so a rule change moves the assertion instead of failing it

**Duplicated verbatim** — `ShopScreen.ui.tsx:306-314` vs `ConfiguringScreen.ui.tsx:134-142`, character-identical apart from the gate variable name:

```ts
const next = previewConfig ? pipelineModifiersFor([...configs, previewConfig]) : undefined;
const nextPerAnswer = previewConfig ? perAnswerPreviewFor([...configs, previewConfig], gate) : undefined;
```

**`swatchForGate` is called twice from one number.** `RunView.gateTheme` is already `swatchForGate(state.gatesCleared)?.theme` (viewmodel:327), and `RunShop.component.tsx:26` passes it to `Screen`. The UI calls `swatchForGate` again at `ShopScreen.ui.tsx:221`, plus `PrepScreen:117`, `GateStakeReceipt:94`, `RewardScreen:54`, `StripScreen:49`, `RunHud:107` — six UI call sites re-deriving a view field.

## Todo

- [x] Added `RunView.offers: readonly ShopOffer[]` — verdicts and numbers, not sentences (see below)
- [x] ShopScreen renders offers; dropped `draftCost` and both pipeline-preview imports
- [~] Shop reads its preview off the offer; Configuring still previews its own bench — see "What is still open"
- [~] Deferred — `gateTheme` is the theme token, the screens want the whole swatch (gateName, finish); not the same value
- [x] Offer pricing covered in `runView.viewmodel.spec.ts`; the screen spec now states verdicts instead of deriving them

## Summary of Changes

### The shop is handed answers, not roster configs

`RunView.offers` replaces `draftOptions` as what the shop renders. Each `ShopOffer` carries `config`, `priceKb`, `owned`, `locked`, `installable`, `refusal`, `preview` and `previewPerAnswer`.

**The refusal carries numbers, not a sentence** — deliberately against the bean's literal wording, because this file already documents the opposite convention. `shopExitAction`'s own comment says the wording lives in the screen "so every phrasing is reachable from a story instead of only from an engine state that produces it". So `OfferRefusal` is `{ reason: "no-slot" }` or `{ reason: "too-expensive", priceKb, storageKb }`, and a new `offerRefusalText` sits directly beside `shopExitAction` to format it.

### What left the screen

Deleted outright: `isOwned`, `isLocked`, `canAfford`, `canInstall`, `installRefusal`, and the two `previewConfig` derivations. Imports dropped: `draftCost`, `perAnswerPreviewFor`, `pipelineModifiersFor` — so `pipeline/domain` is no longer imported by the shop at all.

**`lockedOfferIds` stopped being a prop entirely.** The shop was its only consumer, and each offer now knows whether it is held — so the field is gone from `ShopScreenProps`, `RunShop.component` and `proto-run`.

| | before | after |
|---|---|---|
| ShopScreen props | 29 | **28** |
| RunShop forwarded `view.*` | 22 | **22** |
| cross-aggregate domain imports | 4 aggregates | **2** (`config`, `gate`) |

The prop count barely moves because one array replaced one array — the win is what the screen no longer has to *work out*, not what it is handed.

### The specs swapped jobs

Seven `ShopScreen` tests were computing verdicts from `configs`/`slots`/`storage` and asserting the rendering. They now **state** the verdict (`refusal: { reason: "no-slot" }`) and assert only that the screen draws it — which is the honest contract for a Tier-1 component.

The rules moved to `runView.viewmodel.spec.ts` as `describe("the view prices the shop's offers")`, 6 tests. **Mutation-checked**: deleting the `no-slot` guard fails the viewmodel spec and — correctly — *not* the screen spec, which is the proof the rule now has exactly one guardian.

New `createMockShopOffer(config, overrides)` in `runView.factory.ts` defaults to "installable, affordable, not owned", so a spec states only the verdict it is about.

### What is still open

- **ConfiguringScreen still previews its own bench.** The duplicated block the bean named is gone from the shop, but Configuring previews `view.available`, a different list, so it needs its own projection rather than sharing this one. Worth a follow-up if it bothers you; it is one call now, not a duplicate pair.
- **The loadout half is untouched.** `sellRefund`, `isUpgradable`, `canUpgrade`, `upgradeStorageCost`, `upgradeCoverageRequired` still price installed configs inside the screen. That is why `config/domain` survives in the import list. Same treatment would suit it.
- **`swatchForGate` stays.** Re-checked and rejected: `view.gateTheme` is only the theme token, while the screens want `gateName` and `finish` off the whole swatch. Not the same value, so reading the view there would lose information.

Verified: tsc 0 errors, oxlint clean, depcruise 0 violations (537 modules), **1493 tests passing** (was 1487; +6).
