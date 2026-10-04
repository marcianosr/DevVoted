---
# DVTD-7gzu
title: The prep bar holds its exact reading open
status: completed
type: task
priority: normal
created_at: 2026-09-27T19:15:00Z
updated_at: 2026-09-27T19:27:11Z
---

**What:** Press the prep coverage bar and it holds a reading open: the exact percentage and the band it lands in.

**Why:** Prep marks the bar in rungs and counts it in units, so the percentage and the band word were only ever in its aria-label.

## Done when

- [x] Pressing the prep bar opens a reading that stays
- [x] The reading states the exact percentage and the band word
- [x] No other screen's bar grows a press it did not ask for

## Summary of Changes

A tooltip was the wrong shape: a panel below the bar that had to be pressed. The reading belongs on the **pin**, which already floats at the exact point and already wears the band's colour. The pin's label is now a `Badge` in that colour stating the figure **and** the band word, and prep passes `pin: true` so it never goes. The tooltip and its `fill` prop are reverted — nothing else wanted them.

The prep bar carries no `units` (`PrepView.component.tsx:156` builds it from the ladder alone), so the figure is already the percentage: `56% OK`. `PINS` grew from `h-5` to `h-7` to seat a badge over the stem.
