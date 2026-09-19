---
# DVTD-eul8
title: 'Slot marks: cap-and-compress vs content-width chip'
status: scrapped
type: task
priority: normal
created_at: 2026-09-05T18:50:29Z
updated_at: 2026-09-16T18:56:51Z
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

## Reasons for Scrapping

Scrapped 2026-09-16: the decision this bean was waiting on was made a while ago,
in an ADR that names this bean by id.

`docs/adr/060-the-slot-mark-is-a-figure.md` (Accepted 2026-09-05, DVTD-3ib9):

> **DVTD-eul8** tried to patch that by capping the mark's width and letting the
> bars divide it; capping at 4 slots gives 8 bars about 2px each, which reads as
> mush rather than as a count.

**Neither candidate won.** ADR-060 Decision 1 took a third option: `Weight.ui.tsx`
draws one fixed-width block holding the slot count as a numeral, so "the
cap-and-compress question does not arise". Shipped and in use — `DexChip.ui.tsx:70`
renders `Weight`, not `Slots`.

So the last todo ("Marciano picks one; delete the loser same session") was half
done: the pick happened, the deletion did not.

**Residue cleaned with this scrapping:** the losing cap-and-compress branch was
still sitting in `src/ui/terminal-theme/Slots.ui.tsx` as unreachable code —
`MARK_CAPPED`, `BAR_CAPPED`, the `capSlots` prop and the two capped branches.
`grep -rn capSlots src` hit only that file, so nothing called it. Removed.

`Slots` itself stays: ADR-060 explicitly keeps `Slots solid`, and
`ConfigsPanel.ui.tsx` calls it at four sites.
