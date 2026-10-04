---
# DVTD-v4mg
title: A perfect gate reads 56% until the close
status: completed
type: bug
created_at: 2026-10-02T08:34:53Z
updated_at: 2026-10-02T08:34:53Z
parent: DVTD-lk20
---

**What:** The poll bar showed coverage before the accuracy multiplier, so five right read about 56% and jumped to 100% at the close.

**Why:** A meter that disagrees with the verdict it leads to reads as a bug, and hides the reward for knowing the answers.

## Done when
- [x] The poll bar reads the guaranteed floor: the multiplier as if every poll still ahead is missed
- [x] The bar never falls on a wrong answer
- [x] The fifth answer reads what the close pays
- [x] The hidden mix of upcoming polls is not leaked by the bar

## Notes
- Reported in a playtest 2026-10-02 (5 of 5 right at gate 0, ~60% then 100%).
- guaranteedWindowOutputOf in gateStake.viewmodel.ts feeds carriedUnits in runView.viewmodel.ts; unseen polls count as MULTIPLE_CREDIT until mixKnown. accuracyViewFor shares its pending helpers.
- Raw-output reading was ADR-161 §1 to keep the mix hidden; amended there, wiki §2.6 updated.
- Planning Poker's estimate payout still lands only at the close (it depends on the committed estimate).
- The poll lead now reads fractional changes ("1.08 of 9 changes"); see the copy follow-up on hiding the denominator.

## Summary of Changes
Live meter switched from raw units to the guaranteed floor; specs pin floor values, monotonicity, the skip rise, and fifth-answer equality with the close.
