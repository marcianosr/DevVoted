---
# DVTD-8alw
title: Prefetch reveals the window's answer types
status: completed
type: feature
priority: normal
created_at: 2026-09-03T20:37:53Z
updated_at: 2026-09-04T05:57:16Z
---

- [x] answerTypesOf in run.model, RunView.answerTypesThisGate gated on prefetcherFor
- [x] Prep's poll type row fills when Prefetch is in the build, ??? otherwise
- [x] Config copy names the new reveal

## Summary of Changes

Same slice as `upcomingCategories` (this gate's REMAINING polls), so the two lines always describe the same set. Aggregate only: how many single, how many multiple, not which poll is which.

## Open: what Prefetch v2 buys

Prefetch has no `maxLevel`, so it is upgradable today and an upgrade currently does NOTHING — `levelUp` only bumps `level`, and no Prefetch field reads it. Whatever v2 becomes, it closes a live hole where the shop sells a no-op.

## Follow-up: both lines are counted tallies

Categories now count the draw (`javascript 2 · react 1`, biggest first, ties keep first-appearance order) instead of listing it poll by poll, and poll type reads the same way with the count leading (`3 single · 2 multiple`). One `TallyLine` renders both; `countFirst` flips which side the number sits on. Counts are viridian, labels muted, category names lowercased to match the row labels.

Design consequence worth keeping: v1 now sells the DISTRIBUTION, not the ORDER. Which poll is which — and which of them is the multi-answer one — is unclaimed, which is exactly the per-poll precision a Prefetch v2 could sell.
