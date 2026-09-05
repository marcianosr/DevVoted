---
# DVTD-sawl
title: 'Prep, clear and shop screen polish: inline requirements, coverage bar, slot track placement'
status: completed
type: task
priority: normal
created_at: 2026-09-03T15:09:24Z
updated_at: 2026-09-03T17:15:06Z
---

Live-playtest feedback on the terminal-theme run screens.

- [x] PrepScreen: Required section renamed to Requirements
- [x] PrepScreen: requirement rows read inline (name left, reading right) like the bills rows
- [x] Coverage requirement shows a small coverage bar that can read over the demand (spillover)
- [x] SlotTrack sits under the Build heading, the Build storage foldable goes (shop screen too)
- [x] GateClearScreen: coverage total shows the same bar against the gate demand (met / missed / spilled)
- [x] PrepScreen: On a clear moves into the narrow column, not full width
- [x] StoragePlan: the held rung scrolls into view
- [x] StoragePlan: greens become the screen theme colour

## Summary of Changes

New `CoverageBar.ui.tsx` (terminal-theme): one track sized to `max(held, demand)`, viridian up to the demand and celadon past it, so short / met / spilled all read off the same bar. Wired into the prep Requirements row and the gate clear coverage total; `PrepScreen.required.coverage` now takes `{ reading, held, demand }` and `GateClearScreen.coverage` takes `held` + `demand`.

Layout: the slot track moved inside the Build section on both PrepScreen and ShopScreen and the standalone Build storage foldable is gone; On a clear moved into the right column.

StoragePlan: the centering effect read `offsetLeft` against the page because the scroller was not positioned, so the held rung scrolled off the left edge; the track is `relative` now and the effect re-runs when the held rung changes. Its viridian/celadon greens are theme utilities.
