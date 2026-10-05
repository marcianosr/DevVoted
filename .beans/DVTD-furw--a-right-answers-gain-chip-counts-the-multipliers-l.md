---
# DVTD-furw
title: A right answer's gain chip counts the multiplier's lift
status: completed
type: bug
priority: normal
created_at: 2026-10-05T17:32:32Z
updated_at: 2026-10-05T17:32:32Z
---

**What:** The gain that flies onto the coverage bar after a right answer states that answer's own points, not the bar's whole rise.

**Why:** A third right single at Pallet read +20.7% instead of +20%, because the accuracy multiplier rising on the answers already on the bar was credited to the newest one.

## Done when
- [x] A right single at Pallet reads +20% whatever answers came before it
- [x] The bar still animates to the real coverage
- [x] No chip flies when the bar does not rise
- [x] A spec reproduces the third-answer case

## Notes

The chip came from `gainFigureOf(before.coverageHeld, after.coverageHeld)`, a diff of the whole bar. Bar coverage is window units times the guaranteed accuracy multiplier, so when the multiplier moved from 1.0 to about 1.011 on the third right single, all three units grew and the chip took the 0.7. Fix: `pollFlightFor` builds the figure from `coverageGainPercentFor(answered.coverageEarned, gateNumber)`, the same helper the gate result and prep use; `fromHeld`/`toHeld` stay whole-bar values for the animation. ADR-171 decision 2.

## Summary of Changes

- `gainFigureOf` takes one answer's gain percent; `pollFlightFor` feeds it the answer's own units and keeps the no-rise guard explicitly.
- Specs: the third right single at Pallet (bar 60.7, chip +20%); PollView fixtures now use units (1 unit at Pallet) instead of a percent in `coverageEarned`.
- CHANGELOG Fixed entry.
