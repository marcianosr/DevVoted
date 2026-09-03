---
# DVTD-xmu7
title: 'Storage configs system: 6 configs, 2 shops, gate 3 lock'
status: scrapped
type: feature
priority: normal
created_at: 2026-08-07T17:38:55Z
updated_at: 2026-08-09T08:31:38Z
---

## Engine Layer ✅
- StorageConfig type and STORAGE_CONFIGS roster (6 configs, 5 levels each)
- aggregateStorageEffects() for stacking effects 
- RunState: ownedStorageConfigs (map of configId → level)
- upgradeStorageConfig() + deinstallStorageConfig() reducer actions  
- finishReward() clamps to dynamic cap from storage configs
- RunView: projects availableStorageConfigs + aggregated effects (cap, draftReduction, refundBoost, payoutBoost, freeRebuild)

## UI Layer ✅
- Remove old tier system from ShopScreen 
- Split Shop into PipelineShop + StorageShop (separate pages)
- StorageShop shows 6 configs with level indicators, costs, deinstall prices
- Add gate 3 lock to both shops
- Wire new props in RunShop.component.tsx and proto-run.tsx
- Update test fixtures

## Reversal (2026-08-09)

Marciano decided to cut this feature entirely after seeing the StorageShop screen in the running app. Full revert, not a hide: engine, viewmodel, UI, validation, tests, and the dead-code RunStorageShop.component.tsx (never wired into any route).

Note found during removal: draftCostReduction/refundBoost/payoutBoost/freeRebuild/capAddKb/metaStorageBoost were computed and displayed but never actually consumed by draftCost/sellRefund/rebuildCost/gateClearPayout — the economic effects were cosmetic-only, never wired into the real formulas. Confirms this was safe to fully remove with no economy fallout.

### Removal checklist
- [ ] rules.model.ts: remove StorageConfig/StorageConfigEffect types, STORAGE_CONFIGS, getStorageConfig, aggregateStorageEffects
- [ ] run.model.ts: remove ownedStorageConfigs, upgrade-storage/deinstall-storage actions + reducer fns, static storage cap in finishReward
- [ ] runView.viewmodel.ts: remove ownedStorageConfigs/availableStorageConfigs/draftCostReduction/refundBoost/payoutBoost/freeRebuild, static storageCap
- [ ] validation/schemas.validation.ts: remove upgrade-storage/deinstall-storage schemas
- [ ] delete StorageShop.ui.tsx, RunStorageShop.component.tsx
- [ ] ShopScreen.ui.tsx + spec: drop dead storage props
- [ ] RunShop.component.tsx: remove Storage Shop Section
- [ ] proto-run.tsx: remove Storage Shop Section, single-column shop layout
- [ ] test/runView.factory.ts: drop storage-shop fields
- [ ] lint, typecheck/build, full test suite

## Reasons for Scrapping

Cut after seeing the StorageShop screen live (screenshot review, 2026-08-09): the 6-config storage shop didn't earn its keep as a second shop screen. Full revert across engine/viewmodel/UI/validation/tests — not a hide.

Verification: full test suite (1292 passed, same 6 pre-existing failures unrelated to this change — 3 in run.model.spec.ts economy/lint, 2 in RewardScreen.spec.tsx, 1 in draft.model.spec.ts caused by an unrelated in-flight configRoster.model.ts change), lint (oxlint + dependency-cruiser) clean, tsc clean except one pre-existing unrelated error in categoryWeight.service.ts (missing 'vue' category, untouched file).
