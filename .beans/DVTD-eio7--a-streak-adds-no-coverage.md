---
# DVTD-eio7
title: A streak adds no coverage
status: completed
type: task
created_at: 2026-10-01T19:13:25Z
updated_at: 2026-10-01T19:13:25Z
parent: DVTD-emp3
---

**What:** The +0.1 coverage each right answer in a row added is removed.

**Why:** It was too small to notice and paid knowledge twice on top of the multiplier.

## Done when

- [x] A right answer in a streak covers what the first one did
- [x] The streak still raises the clear's KB
- [x] Old receipts still show their streak row
- [x] The engine balance guard still holds

## Notes

ADR-169. STREAK_UNIT_STEP and streakUnitBonus deleted; answerPayoutFor lost its streakBefore argument; CoverageBreakdown.streakBonus is optional for saved receipts. Flawless overflow at Pallet is 2 KB now (10 of 9 changes). Engine after: lean .00/.19/.68, ×2 .06/.29/.71, ×3 .47/.77; ×2 at 70% is .06 under target, left for a playtest.

## Summary of Changes

Removed; specs updated in answerPayout, answer, rules and shopAction.
