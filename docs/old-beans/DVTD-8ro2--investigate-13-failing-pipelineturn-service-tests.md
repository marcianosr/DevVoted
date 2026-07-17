---
# DVTD-8ro2
title: Investigate 13 failing pipeline/turn service tests on main
status: completed
type: bug
priority: normal
created_at: 2026-06-01T12:25:08Z
updated_at: 2026-06-01T12:53:11Z
---

Tests in pipeline.service, pipelineEvaluator.service (cold-start), and turn.service have been failing on main. Investigate root cause and propose a fix.

## Root Cause

Commit `88683a7` ("chore: remove cold start easy risks", May 20 2026) removed the `low` and `medium` difficulty variants from `cold-start` in `STARTER_SLOT_DEFINITIONS` (`src/domains/runs/data/pipelineSlots.ts:112-123`). The intent was clearly to make cold-start a hard-only challenge. But two adjacent surfaces weren't updated:

### 1. Test fixtures still use non-existent combos

- `pipeline.service.spec.ts:18-30` constructs `allTypesAtMedium` and `allTypesAtCritical` using `getSlotDefinition('cold-start', 'medium')!` — the `!` non-null assertion lies, so `null` ends up in the array. Downstream code (`pipeline.service.ts:47`) then crashes with `Cannot read properties of null (reading 'gateTypeId')`.
- `pipelineEvaluator.service.spec.ts:201-202` does the same with `cold-start@low` and `cold-start@medium`.

### 2. `generateUpgradeCards` doesn't filter difficulty weights per slot type

`pipeline.service.ts:119-138` picks a difficulty via global `pickWeightedDifficulty(weights)` THEN tries `getSlotDefinition(type, difficulty)`. If the combo doesn't exist, it `continue`s and silently produces fewer cards. With `Math.random` mocked to 0 at gate 1 (weights low:80%), cold-start always rolls 'low' → null → skipped. 3 expected cards become 2.

In **production**, this means at gate 1 (weights low:80, medium:15, high:4, critical:1), cold-start is only successfully offered ~5% of the time when its turn comes up. That's a real game-design bug, not just test failure.

## Proposed Fix

Three parts:

1. **Runtime** — Add per-type difficulty filtering in `generateUpgradeCards`. Filter `weights` to difficulties that exist for the chosen gate type before picking. Guarantees no null slots.
2. **Test fixtures** — Update `pipeline.service.spec.ts` fixtures to use `cold-start@critical` instead of `cold-start@medium`.
3. **Evaluator tests** — Update `pipelineEvaluator.service.spec.ts` cold-start describe block to test the new count values (high=1, critical=2) instead of the old (low=1, medium=2, critical=4).

## Decision needed

The cold-start critical count changed from 4 to 2 in the May 20 commit. The existing test `'passes when first 4 polls are correct (critical)'` (line 237-243) reflects old behavior. I'll need to rewrite test scenarios to match the new game balance — that's a small but real semantic change to the test suite.

## Summary of Changes

### Runtime fix (`pipeline.service.ts`)
Added two helpers and updated card generation:
- `eligibleDifficultiesFor(gateTypeId)` — returns difficulties that have a defined slot variant for a given static gate type (e.g. `cold-start` → [high, critical]).
- `filterWeightsTo(weights, eligible)` — zeroes out weights for ineligible difficulties so `pickWeightedDifficulty` only rolls valid combinations.
- `generateUpgradeCards` now filters weights per static type before picking a difficulty, so cold-start never rolls low/medium and silently produces fewer cards.
- `getUpgradeableSlots` now uses `nextDifficultyExists` which checks both that getNextDifficulty returns non-null AND that the next-tier slot definition actually exists (so e.g. short-window@low isn't included as upgradeable since short-window has no medium variant).

### Test fixture updates (`pipeline.service.spec.ts`)
- Renamed `allTypesAtMedium` → `allTypesActive` (it's no longer uniformly medium because cold-start has no medium variant). cold-start is now at `high` in this fixture.

### Test scenario rewrite (`pipelineEvaluator.service.spec.ts`)
- Cold-start describe block updated to match new game balance: high (count=1), critical (count=2).
- Removed obsolete tests for low/medium tiers (no longer exist).
- Removed the "first 4 polls correct" test (critical now requires 2, not 4).
- Updated reward assertion to match critical-tier reward (480KB) instead of old medium-tier (120KB).

### Results
- Before: 28 test files, 13 failed, 348 passed
- After: 28 test files, 0 failed, 359 passed (6 skipped, 1 todo)

### Production impact
The runtime fix isn't just test-cosmetic — it fixes a real game balance bug. Before: at gate 1 (weights low:80%, medium:15%), when cold-start was rolled into the add-pool, it was silently dropped ~95% of the time, leaving players with only 2 add-slot cards instead of 3. After: cold-start@high or @critical is always offered when its turn comes up.
