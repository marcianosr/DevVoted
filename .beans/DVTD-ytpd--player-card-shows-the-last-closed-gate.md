---
# DVTD-ytpd
title: Player card shows the last closed gate
status: completed
type: bug
priority: normal
created_at: 2026-10-15T11:19:12Z
updated_at: 2026-10-15T11:22:02Z
---

**What:** The player card reads the gate a player last closed, with the coverage and band the gate result showed.

**Why:** It graded a run-wide share against the next, unplayed gate, so a 130% PERFECT Pallet read as "Pewter 64% OK".

## Done when

- [x] After a close, the card names the closed gate and its reached coverage and closing band
- [x] Before any close, the card keeps reading the current gate
- [x] An old close without a stored ladder still reads
- [x] Changelog notes the fix

## Notes

Standing carried runShareOf(lifetime units, current gate) and bandAtLadder against baseGateLadderAt(current gate). The fix carries state.lastClose through ClimberRow into Standing; held = reached ?? held, as gateClose.viewmodel does.

## Summary of Changes

ClimberRow keeps the run's lastClose; standingOf turns it into a ClosedGate (reached, else held; stored ladder, else the base one; skipped when the close stored no coverage). standingFor reads that gate, falling back to the current gate before any close. Covers the hover card and the profile screen.
