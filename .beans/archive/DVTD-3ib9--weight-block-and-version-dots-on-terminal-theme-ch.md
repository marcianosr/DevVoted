---
# DVTD-3ib9
title: Weight block and version dots on terminal-theme chips
status: completed
type: task
priority: normal
created_at: 2026-09-05T19:29:04Z
updated_at: 2026-09-05T19:49:20Z
---

Replace the segmented slot mark with a numeric weight block, and DexChip's version mark with a dot track. Size hue moves from the bars onto the chip border and the block's edge.

Plan: ~/.claude-work/plans/create-the-dots-refactored-stearns.md

## Todos

- [x] sizes.ts: left unchanged (hue stayed on the block, not the border)
- [x] Weight.ui.tsx + story + spec
- [x] VersionDots.ui.tsx + story + spec
- [x] DexChip: Weight, VersionDots, maxVersion required
- [x] Swap 6 segmented Slots call sites + story call sites
- [x] Thread maxVersion through row types and Tier-2 adapters
- [x] DexChip.spec rewrite + new Slots.spec
- [x] Shop build/offer rows draw DexChip; numeric version + maxVersion
- [x] ADR 060 + wiki 4.2 + CHANGELOG
- [x] lint + tests + build

## Summary of Changes

`Weight.ui.tsx` draws the slot count as a figure in a fixed-width block with a size-hue edge (prismatic from 8 slots up), replacing every segmented `Slots` call in the kit. `VersionDots.ui.tsx` draws one circular pip per version, filled to the version held; `DexChip` now always takes `maxVersion` and draws it, retiring the boxed-rung/fraction split. Shop build and offer rows draw the same chip, so their `version` changed from a "v2" string to a number plus `maxVersion`. `Row`'s name column widened w-48 to w-56.

Three design calls reversed mid-session on Marciano's live look: the size hue went onto the chip border and came back off (reads as an alert), the last pip was a square and became a circle, and the pips shrank twice.

ADR-060 records it; wiki 4.2 and the CHANGELOG updated. `sizes.ts` ends up unchanged.

Verified: `npm run lint` clean, `npx tsc --noEmit` clean, 3465 tests pass. Three failures in `src/ui/modern-theme/screens/RewardScreen.spec.tsx` are pre-existing, reproduced on a worktree at HEAD without these changes.
