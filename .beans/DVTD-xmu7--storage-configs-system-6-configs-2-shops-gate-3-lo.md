---
# DVTD-xmu7
title: 'Storage configs system: 6 configs, 2 shops, gate 3 lock'
status: in-progress
type: feature
priority: normal
created_at: 2026-08-07T17:38:55Z
updated_at: 2026-08-07T17:44:49Z
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
