---
# DVTD-po2n
title: Accuracy is one bar of the multiplier
status: completed
type: feature
created_at: 2026-10-02T09:33:19Z
updated_at: 2026-10-02T09:33:19Z
---

**What:** The poll screen's accuracy track is one bar from ×1 to ×2, solid to the sure multiplier and faint to the best case.

**Why:** Five segments read as five polls, and the player could not see what the multiplier was doing.

## Done when
- [x] The track draws one bar with a sure fill and a best-case fill
- [x] The figure reads the sure multiplier and the best still open
- [x] Neither reading leaks the sealed mix
- [x] A right answer pulses the bar

## Notes
- guaranteedMultiplierOf and bestMultiplierOf in gateStake.viewmodel.ts; AccuracyView.multiplier replaced by guaranteed and best; guaranteedWindowOutputOf now reads the same multiplier.
- segment-pulse renamed accuracy-pulse in app.css and loses its scale (a full-width bar must not jump).
- Amends ADR-170 (answer lands) decision 6 and ADR-161 §1's mix rule.
- A carried accuracy meter (caps per gate, minus 2 a miss) is being simulated separately, no rule change.

## Summary of Changes
AccuracyTrack rewritten as one bar; viewmodel, fixture, story and specs updated.
