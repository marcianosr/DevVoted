---
# DVTD-63ny
title: 'feat: GatePathmap UI component'
status: completed
type: feature
priority: normal
created_at: 2026-07-07T12:54:19Z
updated_at: 2026-07-07T13:01:33Z
---

Rich gate pathing visualization with fractional player positioning, difficulty blocks, poll tick marks, and uncharted zone. Replaces GatesMinimap eventually.

## Tasks\n- [x] Add DIFFICULTY_BG to difficultyStyles.ts\n- [x] Add getAllTimeHighestGate() query\n- [x] Create GatePathmap.ui.tsx\n- [x] Create GatePathmap.stories.tsx\n- [x] Create GatePathmap.component.tsx\n- [x] Wire into CommunitySection

## Summary of Changes

Created `GatePathmap` UI component with fractional player positioning (between-gate ticks), pipeline difficulty blocks per player, legend, and uncharted ghost zone. Added `getAllTimeHighestGate` DB query + server function. Wired into `CommunitySection` via `GatePathmapComponent`. Extended `difficultyStyles.ts` with `DIFFICULTY_BG` and `DIFFICULTY_LABEL`. Storybook stories cover single player, multi-player, overflow, high stages, and crit-heavy pipelines.
