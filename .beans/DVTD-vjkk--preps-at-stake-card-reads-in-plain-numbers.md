---
# DVTD-vjkk
title: Prep's At stake card reads in plain numbers
status: completed
type: task
created_at: 2026-10-01T17:43:47Z
updated_at: 2026-10-01T17:43:47Z
parent: DVTD-emp3
---

**What:** Prep's ladder, standing line and Scoring fold state the gate in plain, unambiguous numbers.

**Why:** An outside review of the At stake card found ambiguous band edges, a terse standing line, a percent where points were meant, and only the ×2 end of the multiplier curve.

## Done when

- [x] The standing line reads as a sentence: cover N more changes to reach a band
- [x] Each band row states where it starts, so no edge belongs to two bands
- [x] A band that holds the gate says so beside its peel
- [x] Scoring states a change in points, explains the codebase, and lists the whole multiplier curve
- [x] The KB each band quotes counts the accuracy multiplier

## Notes

Review pasted 2026-10-01. Rejected from it: 5 polls = 5 changes (ADR-161 §6 measured Pallet at 5: PERFECT at three right). The progression table was already a collapsed fold. PERFECT's KB was shipped in DVTD-y1hw.

Files: bandOutcomes.viewmodel.ts (standingLineFor, paysOf, answersOwedFor now uses gateOutputOf), scoring.viewmodel.ts (codebase and curve statements, pts), BandLadder.ui.tsx (rangeOf lower bounds).

## Summary of Changes

Built as listed; specs updated in bandOutcomes, scoring, BandLadder, PrepScreen and PrepView. ADR-161 §6 notes the review.
