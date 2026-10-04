---
# DVTD-x5jr
title: Coverage alone decides the gate
status: completed
type: feature
priority: high
created_at: 2026-10-01T15:19:13Z
updated_at: 2026-10-01T15:42:38Z
---

**What:** The gate no longer asks for a count of right answers; coverage alone decides, a carried head start can never clear a gate by itself, and Pallet ships five changes so a perfect bar needs four or five right.

**Why:** A rule counted in right answers is one no config can touch and stops binding by the middle of the run, and PERFECT landed at three of five on the early gates, so their last polls carried no tension.

## Done when

- [x] A window is judged by the band its coverage closes in, with no separate right-answer minimum
- [x] A head start alone never clears a gate
- [x] At Pallet three right reads HEALTHY and only four or five fill the bar
- [x] Prep and the gate result no longer state a right-answer minimum
- [x] Three archetypes (lean expert, a doubled build at 70%, a tripled guesser at 60%) are playtested and the findings recorded

## Notes

Follows DVTD-emp3 and ADR-161; supersedes ADR-157's window minimum. Afterwards only numbers change (codebase, lines, the multiplier's ceiling), not mechanics.

## Summary of Changes

- ADR-161 §6: the window minimum (ADR-157) is removed; old closes keep `heldBy: "unscored"` as a reading. A head start is capped at the next gate's floor (`headStartFor`). Pallet ships 5 changes (codebase 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 10, 10, 11).
- `GateWindow.baseUnits`, `MIN_WINDOW_UNITS`, `meetsWindowMinimum`, `windowScored`, `scoredThisGate`/`scoredUnits` and the prep minimum row are gone; legacy snapshots read `baseUnits` only to hydrate `accuracyEarned`.
- The balance guard now runs the real reducer (`runAction.model.spec.ts`, "the balance the whole engine holds"); the two abstract guards it replaces were deleted from `coverageRatio.model.spec.ts`.
- Gate outcome copy: "Boulder ships 5 changes."

Playtest (engine, 300 runs each, build fixed, shop skipped):
- Lean expert at 90%: wins .66; gates 0-6 close PERFECT 89-97%; deaths cluster at 10-12 (48 of 300 at the Champion, which needs all five right). PERFECT on 3 or fewer right at gates 0-3: 20 of 1121.
- x2 at 70%: wins .47; early PERFECT on 3 or fewer right: 479 of 1142.
- x3 guesser at 60%: wins .54; early PERFECT on 3 or fewer right: 685 of 1089; clears with one exact answer up to gate 9.
- Not tested: shop income and buying (build fixed), audits drawn mid-run, screens.
