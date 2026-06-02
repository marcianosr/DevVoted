---
# DVTD-h111
title: Category-mastery pipeline fails when window can't supply enough polls
status: completed
type: bug
priority: high
created_at: 2026-06-02T12:03:18Z
updated_at: 2026-06-02T12:06:10Z
---

## Problem

A player died at Gate #6 with three category-mastery pipeline failures, each showing "Current: 1/1 correct":
- ≥2 CSS polls correct (only 1 CSS appeared in the 5-poll window)
- ≥2 TypeScript polls correct (only 1 TS appeared)
- ≥3 JavaScript polls correct (only 2 JS appeared)

The player answered every category-relevant poll correctly but still failed — the requirements were mathematically impossible to satisfy in a 5-poll window.

## Root Cause

In `src/domains/runs/services/pipelineEvaluator.service.ts:115-124`, the `category-mastery` slot skips evaluation only when `appeared === 0`. The instant 1 poll of the category appears, the slot becomes active and fails if `correct < minCorrect`, even when satisfying the requirement is physically impossible given the polls that appeared.

`GateHealth.component.tsx:71-75` also displays `correct/appeared` instead of `correct/minCorrect`, hiding the real threshold from the player.

## Fix Approach

1. Widen the `skipped` guard in `pipelineEvaluator.service.ts`: skip when `appeared < minCorrect`. For critical (`minCorrect === null`), require at least 1 poll to evaluate.
2. Update `GateHealth.component.tsx` to display `correct/minCorrect` so the player sees the real target.

## Todos

- [x] Update `pipelineEvaluator.service.ts` category-mastery branch to skip when `appeared < minToEvaluate`
- [x] Add/update unit tests in `pipelineEvaluator.service.spec.ts` covering: skipped when impossible, passed when enough correct, failed when enough appeared but not enough correct
- [x] Update `GateHealth.component.tsx` (and `UpgradePipelineSection.component.tsx`) category-mastery progress label to reference minCorrect
- [x] Run typecheck and tests

## Summary of Changes

**Code changes:**
- `src/domains/runs/services/pipelineEvaluator.service.ts`: widened the `skipped` guard in the `category-mastery` branch so a slot is skipped when `appeared < minToEvaluate` (where `minToEvaluate = minCorrect ?? 1`). A player who answered every available poll of the category correctly no longer fails on an unsatisfiable requirement.
- `src/domains/runs/services/pipelineEvaluator.service.spec.ts`: added 5 tests for the new skipped scenarios (medium needs 2 but only 1 appeared, high needs 3 but only 2 appeared, skipped contributes 0 reward, critical skipped when 0 appeared, critical still evaluates with 1 appeared).
- `src/domains/runs/components/UpgradePipelineSection.component.tsx`: changed the category-mastery `Current:` display from `correct/appeared` to `correct/minCorrect` so the player sees the real target. Critical (minCorrect=null) still displays `correct/appeared`.
- `src/domains/runs/components/GateHealth.component.tsx`: same display fix.

**Verification:**
- All 364 tests pass (including 5 new ones).
- `tsc --noEmit` clean.
- Lint clean for changed files (one pre-existing warning in unrelated `economy/api/handlers.ts`).

**Trade-off accepted:** a player with unlucky poll distribution may now skip a hard category-mastery slot and lose its reward — they keep their run but miss the bonus. This is correct: they were never going to earn that reward anyway.
