---
# DVTD-fhuc
title: A card's two presses say what they cost and what they pay back
status: completed
type: feature
created_at: 2026-09-26T14:32:22Z
updated_at: 2026-09-26T14:32:22Z
---

**What:** Install is a solid pale press and Uninstall states the storage it refunds in a green cap beside its label.

**Why:** Every press on a card wore the same dark box, so the one the card is asking for did not stand out, and the figure a player weighs before removing a config sat in small print under it.

## Done when

- [x] The install press wears the bright fill, pinned to one colour rather than the screen's
- [x] The uninstall press states the word and the refund, with a mark for what it hands back
- [x] The refund is stated once per card, never twice
- [x] The kit's tone and cap tables carry the new shapes, with stories and specs

## Notes

Mocks from Marciano: a pale filled Install, and `Uninstall ↩ +32 KB` with the cap in green.

## Summary of Changes

- `Button` gained a `bright` tone: the `segment-theme` fill `Action` already
  uses, pinned to pallet so a card's press never reads as a second copy of the
  press the screen is asking for.
- A cap can now trail its label and wear a colour of its own, and takes a node
  rather than a string, so the refund carries a drawn arrow instead of a thin
  typographic one.
- Uninstall dropped the danger tone and the `×` glyph. Removing a config is a
  trade, not a loss: the press is quiet and the gain is the only colour on it.
- The card's footer drops `uninstalls for` while the press is quoting the same
  figure. A card with no uninstall press keeps the line, since that is then the
  only place it is stated.
- New kit icon `undo`.

Verified: 4007 tests pass, typecheck clean, lint and architecture boundaries clean.
