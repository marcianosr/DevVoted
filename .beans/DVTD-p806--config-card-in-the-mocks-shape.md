---
# DVTD-p806
title: Config card in the mock's shape
status: completed
type: feature
priority: normal
created_at: 2026-10-04T08:25:12Z
updated_at: 2026-10-04T08:39:42Z
---

**What:** A config card reads its weight and name, folds its description away, keeps its version and badges at the foot, and offers Uninstall in red beside a prismatic Upgrade; the storage bar only animates a config that arrives while you watch.

**Why:** The first pass kept the old card layout around the new presses; the mock's card shape is clearer to read and to act on.

## Done when
- [x] The storage bar does not animate when a screen opens, only when a config arrives
- [x] Folding a card leaves the mock's compact row: name, one-line effect, version and price or refund
- [x] Uninstall is always a red press
- [x] Upgrade sits beside Uninstall as a prismatic press

## Notes
Follows DVTD-bjb4. Plan: cosmic-swimming-frost.

## Summary of Changes

- WeightTrack remembers the fills it opened with (useRef); only later arrivals get .weight-fill-new (slot-in).
- Button tones destructive (raised, cinnabar, no sheen) and prismatic (.press-prismatic drifting Kanto gradient on a lavender plinth).
- ConfigChip card: folded = compact row (chevron, weight, name + truncated effect, version + price/refund badge); the fold holds description, meta (badges, uninstalls for) and the press row (Install / Uninstall + Upgrade side by side). Changed after the user compared the new run card to the mock build row.
- Screen specs unfold a card before pressing; ADR-123 amended twice; wiki + CHANGELOG.
