---
# DVTD-t9gd
title: 'KB economy balance pass: gate reward, legendary, rebuild curve, storage cap'
status: scrapped
type: task
priority: normal
created_at: 2026-07-27T16:37:20Z
updated_at: 2026-07-27T16:45:29Z
---

One-pass retune of run-economy constants in src/modules/run (live module only; prototype + legacy reroll left untouched).

## Changes
- [ ] Gate reward 120 -> 80 KB (rules.model.ts GATE_REWARD_KB)
- [ ] Legendary draft 160 -> 256 KB (config.model.ts DRAFT_COST.legendary; sellRefund derives to 128)
- [ ] Rebuild curve Fibonacci -> powers of 2 [4,8,16,32,64,128,256,512], cap 512 (draft.model.ts; rename REBUILD_FIB_KB -> REBUILD_COST_KB)
- [ ] Storage cap 1024 -> 512 KB (rules.model.ts STORAGE_CAP_KB)
- [ ] Update specs (draft.model.spec, run.model.spec, runView.factory)
- [ ] CHANGELOG + wiki balance numbers

Linter escalation is tracked separately in DVTD-qh9m.

## Reasons for Scrapping

Accidental duplicate of DVTD-ggxi (first create call created this bean before its output parse errored; the retry created ggxi). Work is tracked on ggxi.
