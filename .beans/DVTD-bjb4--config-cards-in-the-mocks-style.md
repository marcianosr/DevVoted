---
# DVTD-bjb4
title: Config cards in the mock's style
status: completed
type: feature
priority: normal
created_at: 2026-10-04T07:56:36Z
updated_at: 2026-10-04T08:05:24Z
---

**What:** Config cards in the shop and on the new run screen buy and sell through a shimmering primary press, fold open and shut smoothly, flip in when dealt, and the storage bar slides as the build changes.

**Why:** The juiced mock's cards read clearer and feel better to buy from than today's head-row presses.

## Done when
- [x] An offer installs through a full-width press reading Install and its price, in the screen's colour, shimmering while it can be pressed
- [x] An offer you cannot afford is dim and grey, its press still and grey
- [x] An installed config uninstalls through the same kind of press, labelled Uninstall
- [x] A card's details fold open and shut smoothly
- [x] Offers flip in when dealt, and the storage bar slides and slots in as configs come and go

## Notes
From ~/Downloads/devvoted-juiced.html (renderShop, renderBuild). Plan: cosmic-swimming-frost. Versions and badges stay.

## Summary of Changes

- Button tone primary: segment-theme press-raised press-sheen, follows the screen theme, greys (not cinnabar) when disabled; .press-sheen:disabled::after hides the shine.
- ConfigChip: on a card, install and uninstall moved from the head to a full-width press row (Install · price / Confirm · price, Uninstall with refund cap); bare chips keep inline presses; skipped cards add grayscale.
- Fold always mounted in .config-fold (grid rows 0fr↔1fr, 300ms), inert + aria-hidden when shut; footer badges render only when open to avoid duplicates. Specs read seen text via ignore [inert] *.
- Registry grid .registry-deal flips offers in staggered; WeightTrack .weight-track transitions flex-grow, .weight-fill slots in on mount.
- Wiki Managing configs paragraph (was stale: popover) and CHANGELOG.
