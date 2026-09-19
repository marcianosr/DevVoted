---
# DVTD-orp3
title: Slot buy/sell lives in the storage bar
status: completed
type: task
priority: normal
created_at: 2026-09-06T10:47:51Z
updated_at: 2026-09-06T10:55:16Z
---

The terminal-theme Build storage section lists 'Slot 5 · 32 KB (+)' as a row beneath the bar. Move the add/sell affordance onto the bar row itself so the next slot reads as the next box.

- [x] SlotTrack takes buy/cash deals and draws them on the bar row
- [x] NewRunScreen drops the SlotDeal rows
- [x] ShopScreen (terminal-theme) drops the SlotDeal rows
- [x] StartView.component + ShopView.component map viewmodel to deals
- [x] Delete SlotDeal.ui.tsx
- [x] Stories + specs updated
- [x] lint, typecheck, tests

## Summary of Changes

The add/sell affordance now sits on the storage bar row instead of in rows beneath it.

- `SlotTrack.ui.tsx` takes optional `buy` / `cash` deals. Each draws a slot-shaped dashed box carrying `+` (viridian) or `-` (cinnabar, hatched like an empty slot) with its `PriceTag` beside it, the tag pointing at its box. The hit area is the button padding, not the 14px box.
- A refused deal disables the press and carries its refusal in the tooltip and the accessible name (`label - price - refusal`), so the refusal no longer needs a row of its own.
- `SlotDeal.ui.tsx` deleted; `NewRunScreen` and terminal-theme `ShopScreen` pass deals through `storage`.
- `StartView.component` / `ShopView.component` map `startSlotDeals` / `slotDeals` to `SlotTrackDeal`.
- New `SlotTrack.spec.tsx` (4 tests) plus three stories.

Verified: `npm run lint` clean, `tsc --noEmit` clean (stories included via a cleared-exclusion config), 3564 tests pass. The 3 `RewardScreen.spec.tsx` failures are pre-existing at HEAD (confirmed in a worktree).
