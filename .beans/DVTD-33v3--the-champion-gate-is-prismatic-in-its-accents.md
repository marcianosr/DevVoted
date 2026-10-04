---
# DVTD-33v3
title: The Champion gate is prismatic in its accents
status: in-progress
type: feature
priority: normal
created_at: 2026-10-04T11:23:29Z
updated_at: 2026-10-04T11:34:32Z
parent: DVTD-kulw
blocking:
    - DVTD-g1p0
---

**What:** The Champion gate's rule, bar and press wear the prismatic gradient over a dark ground.

**Why:** The last gate should feel unlike the twelve before it.

## Done when
- [ ] Playing the Champion gate shows prismatic accents on its screens
- [ ] Text on those screens stays readable

## Notes
ADR-184 D4. Reuse the existing prismatic utilities; no new keyframes. Part of DVTD-g1p0.

## Progress 2026-10-04

CSS landed: under the Champion gate theme the lit coverage, the primary press and the panel glyph wear the Kanto gradient, with a reduced-motion guard. Both boxes stay open until someone has looked at it in a browser.
