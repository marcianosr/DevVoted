---
# DVTD-jhim
title: 'Terminal theme: price tag silhouette + BUILD STORAGE label'
status: completed
type: task
priority: normal
created_at: 2026-09-01T14:08:03Z
updated_at: 2026-09-01T14:13:23Z
---

Rebuild PriceTag to match mock 143: clip-path arrow point (left for costs, mirrored right for receipts), no border, flat fill with light text, 3px dot at 70%, KB unit at full brightness with a wide gap. Rename the shop's Storage section to Build storage.

## Summary of Changes

- PriceTag rebuilt from the mock's measured geometry: clip-path arrow point (6px, left for costs, mirrored right for `receive`), no border, flat fill with a light-tone text (celadon/pallet/vermillion/saffron), 4px notch dot at 70%, KB unit no longer dimmed.
- Shop's slot-track section renamed to "Build storage" so it stops colliding with "Storage plan".
- Legend now counts the markers it is given (`6 running · 1 usable · 1 stopped · 2 sitting out`) and moved under the section title on Poll and Reveal; the hand-written `build.meta` count string is gone, so the line can no longer contradict the rows. DOT_LABEL shortened to running/usable/stopped/sitting out.
