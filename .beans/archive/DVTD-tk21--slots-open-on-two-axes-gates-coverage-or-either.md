---
# DVTD-tk21
title: 'Slots open on two axes: gates, coverage, or either'
status: completed
type: feature
priority: normal
created_at: 2026-08-25T12:28:50Z
updated_at: 2026-08-25T12:44:03Z
---

MAX_SLOTS drops 14 -> 11. Gate clears stop being the only width supply.

Ladder (3 starting slots + 8 grants):

| Slot | Opens on |
| --- | --- |
| 4 | gate 1 cleared |
| 5 | gate 3 cleared |
| 6 | 60% run coverage |
| 7 | gate 6 cleared |
| 8 | 140% run coverage |
| 9 | 240% run coverage |
| 10 | gate 10 cleared OR 300% coverage |
| 11 | gate 12 cleared OR 380% coverage |

Coverage axis reads `state.coverage` (run-lifetime total, all categories), not
the gate's per-attempt meter — ADR-035 split those numbers, which is what makes
a second ladder legal again after ADR-034 deleted the first one.

Width = 3 + how many grants are earned; the reducer keeps taking the max with
live slots, so a coverage dip never shrinks a pipeline.

- [x] pipeline.model: MAX_SLOTS 11, SLOT_UNLOCKS table, slotsFor, nextSlotUnlockFor
- [x] run.model: widen on answer (coverage) as well as on clear (gate)
- [x] runView.viewmodel: nextSlotGate -> nextSlotUnlock
- [x] UI: Slot, SlotUnlockRow, StartScreen, ShopScreen + their callers
- [x] ADR + wiki + CHANGELOG

## Summary of Changes

- `pipeline.model.ts`: `MAX_SLOTS` 14 -> 11; `SLOT_UNLOCKS` table (3 gate / 3 coverage / 2 either); `slotsFor`, `isSlotUnlocked`, `nextSlotUnlockFor` replace `slotsForGatesCleared`/`nextSlotGateFor`.
- Slot 11's gate route is gate 11, not 12: clearing gate 12 wins the run, so a slot behind it could never be filled.
- `run.model.ts`: one `widened` step, called on every answer (coverage) and on every clear (gate). Announces each step, so one answer crossing two thresholds names both.
- `runView.viewmodel.ts`: `nextSlotGate: number | null` -> `nextSlotUnlock: SlotUnlock | null`.
- UI: `Slot`, `SlotUnlockRow`, `StartScreen`, `PrepScreen`, `ShopScreen` and their Tier-2 callers learned the coverage route. StartScreen's clear-reward line now numbers the slot from the live width (it was printing the gate number) and only fires when this gate's clear is what opens it.
- ADR-041 written, ADR-034 Decision 5 marked reversed, wiki sections 2.2/2.5/2.8/3/glossary/constants updated, CHANGELOG entry added.

Follow-up: the copy differs by surface ("Unlocks at 60% coverage" on the modern rail, "Opens when Gate 3 clears" in the shop table).
