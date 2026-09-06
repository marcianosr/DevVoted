---
# DVTD-eul8
title: 'Slot marks: cap-and-compress vs content-width chip'
status: in-progress
type: task
priority: normal
created_at: 2026-09-05T18:50:29Z
updated_at: 2026-09-05T18:52:53Z
---

The slot mark draws one fixed-width bar per slot, so its footprint grows linearly with slot count inside a w-44 DexChip. An 8-slot config crowds the label; 12/16 would clip it. Build two candidate treatments side by side in a story so Marciano can pick one.

Plan: ~/.claude-work/plans/where-does-recommended-come-abundant-river.md

## Todos

- [x] Fix SLOT_REM 0.375 -> 0.25 so solidWidth matches the w-1 segmented bars
- [x] Option 2: bounded mode in Slots.ui.tsx (cap footprint, bars divide it)
- [x] Option 3: drop the w-44 in NewRunScreen.ui.tsx so the chip fits content
- [x] Comparison story in DexChip.stories.tsx over 1/2/4/8/12/16
- [x] lint + tests + build
- [ ] Marciano picks one; delete the loser same session
