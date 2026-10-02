---
# DVTD-j9q1
title: The gain chip pops beside the answer, then rides the bar
status: completed
type: feature
priority: normal
created_at: 2026-10-02T17:28:58Z
updated_at: 2026-10-02T17:33:06Z
---

**What:** After a right answer the gain chip appears next to the answer, holds, then flies onto the bar's old fill edge and slides to the new one with the fill.

**Why:** The chip floated diagonally from an arbitrary point and landed above the bar, so the gain was never readable where it was earned or where it went.

## Done when
- [x] The chip appears beside the picked answer's text and pauses there
- [x] It lands on the old fill edge and rides to the new one in step with the fill
- [x] Reduced motion still lands at once with no chip

## Notes
GainFlight in PollScreen.ui.tsx; PollFlight gains fromHeld.

## Summary of Changes
GainFlight now runs two chained Web Animations: pop + hold beside the answer text, fly to the old fill edge (fires onFlightLanded so the bar starts filling), then ride to the new edge with the bar's own 550ms easing and fade. PollFlight carries fromHeld; the anchor is the picked row's text child and the bar's track element. No animation library: WAAPI covers keyframe offsets, per-segment easing and cancel.
