---
# DVTD-od1l
title: The Shop screen prices its own offers
status: todo
type: task
created_at: 2026-08-13T13:45:01Z
updated_at: 2026-08-13T13:45:01Z
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

- [ ] Add `RunView.offers: readonly ShopOffer[]` (label, priceKb, affordable, installable, refusal, describe text, preview modifiers)
- [ ] ShopScreen renders offers; drop the four config.model imports it no longer needs
- [ ] Extract the shared preview calculation so Shop and Configuring read one function
- [ ] Decide whether the six `swatchForGate` UI calls read `view.gateTheme` instead
- [ ] Cover offer pricing in `runView.viewmodel.spec.ts`; stop computing expectations in `ShopScreen.spec.tsx`
