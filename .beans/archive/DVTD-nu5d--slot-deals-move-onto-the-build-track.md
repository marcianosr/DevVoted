---
# DVTD-nu5d
title: Slot deals move onto the build track
status: completed
type: feature
priority: normal
created_at: 2026-08-30T19:18:49Z
updated_at: 2026-08-30T19:29:25Z
---

The shop's Slots section is deleted. Buying a slot becomes a press on the hatched stub at the end of the build track; cashing one becomes a press on the last empty (dashed) cell. The section's explainer survives as the two tooltips.

## Todo
- [x] SlotTrack takes optional buy/cash deals and renders the two presses
- [x] Delete Slots.ui.tsx + spec, drop slotDeals from the island ShopScreen
- [x] Rewire ShopView.component.tsx to pass the deals to SlotTrack
- [x] Update ShopScreen spec + stories
- [x] lint, typecheck, tests
- [x] Wiki §3 track paragraph + §7 shop actions table, CHANGELOG Unreleased entry

## Summary of Changes

`SlotTrack.ui.tsx` takes optional `buy`/`cash` `SlotDeal`s. Given `buy`, the hatched stub becomes a button printing the price ("16 KB") with the full quote on the tooltip and as its accessible name ("Install a new slot · makes 5 · 16 KB"); a refusal disables it and replaces the tooltip. Given `cash` with a price, the last dashed cell becomes a button printing "+16 KB". Without deals the track renders exactly as before, which is what prep/start/configuring still get.

`Slots.ui.tsx` + spec + stories deleted; `slotDeals` dropped from the island `ShopScreen`; `ShopView.component.tsx` passes the deals into `SlotTrack` instead.

Not carried over: the section's "4 of 24" header. The ceiling now shows only through the stub disappearing at 24.
