---
# DVTD-ggxi
title: 'KB economy balance pass: gate reward, legendary, rebuild curve, storage cap'
status: completed
type: task
priority: normal
created_at: 2026-07-27T16:37:40Z
updated_at: 2026-07-27T16:56:24Z
---

One-pass retune of run-economy constants in src/modules/run (live module only; prototype + legacy reroll left untouched).

## Changes
- [x] Gate reward 120 -> 80 KB (rules.model.ts GATE_REWARD_KB)
- [x] Legendary draft 160 -> 256 KB (config.model.ts DRAFT_COST.legendary; sellRefund derives to 128)
- [x] Rebuild curve Fibonacci -> powers of 2 [4,8,16,32,64,128,256,512], cap 512 (draft.model.ts; rename REBUILD_FIB_KB -> REBUILD_COST_KB)
- [x] Storage cap 1024 -> 512 KB (rules.model.ts STORAGE_CAP_KB)
- [x] Update specs (draft.model.spec, run.model.spec, runView.factory)
- [x] CHANGELOG + wiki balance numbers

Linter escalation is tracked separately in DVTD-qh9m.

## Summary of Changes

All five levers retuned in src/modules/run:
- GATE_REWARD_KB 120 -> 80 (rules.model.ts)
- STORAGE_CAP_KB 1024 -> 512 (rules.model.ts)
- Rebuild curve -> [4,8,16,32,64,128,256,512], cap 512; const renamed REBUILD_FIB_KB -> REBUILD_COST_KB (draft.model.ts)
- Legendary draft cost -> 256 (config.model.ts); common/uncommon/rare also aligned to 32/64/128 in a parallel edit; sell refund follows via floor(cost/2)

Specs updated (draft.model.spec, run.model.spec storage/sell assertions, runView.factory, ConfiguringScreen/RewardScreen mocks, Button/ShopScreen stories). Docs: CHANGELOG entry + wiki numbers table & prose. Verified: lint clean, tsc 0 errors, 936 tests pass. Linter escalation tracked in DVTD-qh9m.
