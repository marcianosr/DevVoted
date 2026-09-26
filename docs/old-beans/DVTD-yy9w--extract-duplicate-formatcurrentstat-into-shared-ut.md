---
# DVTD-yy9w
title: Extract duplicate formatCurrentStat into shared util
status: completed
type: task
priority: normal
created_at: 2026-06-02T12:09:01Z
updated_at: 2026-06-02T12:11:15Z
---

## Problem

`formatCurrentStat` is duplicated across `GateHealth.component.tsx` and `UpgradePipelineSection.component.tsx`. The two copies share identical `cold-start` and `category-mastery` branches but differ in the other 3 cases — GateHealth shows `current/threshold` while UpgradePipelineSection shows just `current` (relying on the adjacent `Requirement: ...` line).

## Plan

1. Extract to `src/domains/runs/utils/formatCurrentStat.ts` with the richer `X/Y` style (it's strictly more informative; the duplication with `formatRequirement` is acceptable since the labels differ — "Requirement" vs "Current").
2. Replace duplicate functions in both components with the shared import.
3. Run typecheck and tests.

## Todos
- [x] Create `src/domains/runs/utils/formatCurrentStat.ts`
- [x] Replace local copy in `GateHealth.component.tsx`
- [x] Replace local copy in `UpgradePipelineSection.component.tsx`
- [x] Run typecheck and tests

## Summary of Changes

- Created `src/domains/runs/utils/formatCurrentStat.ts` with the richer `current/threshold` formatting (matched the GateHealth variant). Both surfaces already render `formatRequirement(...)` next to the `Current:` line, but the inline `/threshold` is still useful as at-a-glance progress.
- Removed local `formatCurrentStat` from `GateHealth.component.tsx` and `UpgradePipelineSection.component.tsx`; both now import the shared util.
- Aligned call signature: util takes `(req, ctx)`. GateHealth's call site now passes `slot.requirement` instead of `slot`.
- Dropped the now-unused `PipelineSlotRequirement` import from `UpgradePipelineSection.component.tsx`.
- UpgradePipelineSection's `short-window` display now reads `req.pollCount` instead of `ctx.pollsInWindow` (same value, more direct).

**Verification:** typecheck clean, 364 tests pass, lint clean for changed files.
