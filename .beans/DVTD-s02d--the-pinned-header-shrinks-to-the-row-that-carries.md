---
# DVTD-s02d
title: The pinned header shrinks to the row that carries the balance
status: completed
type: feature
priority: normal
created_at: 2026-09-28T07:05:36Z
updated_at: 2026-09-28T07:12:08Z
---

**What:** The pinned header becomes one thin row — gate mark, screen name, and a compact balance pill — and hangs on every screen that spends storage, with the swatch track and coverage scrolling away beneath it.

**Why:** The figure every price is read against should follow the page down, but a header that pins whole takes a 13-square track and a coverage reading with it, which is chrome nobody is pricing anything against.

## Done when

- [x] The pinned bar states the gate mark, the screen's name and the balance, and nothing else
- [x] The swatch track, the note and any coverage reading scroll away under it
- [x] The shop, a new run, prep and the poll all pin, from the medium width up
- [x] The balance reads as one compact pill while pinned, and still names its change above itself
- [x] A reader who cannot see the pill is still told the figure is the storage balance
- [x] The poll screen stops pinning its coverage panel, so it never carries three pinned edges
- [x] A story shows the pinned bar against a page long enough to scroll

## Notes

Reverses ADR-132 decision 1 on both clauses: it pinned only the shop and a new run, and pinned the header whole. Amend it in place rather than writing a new one.

Its decision 3 is stale on arrival — it describes a seat the bar publishes and an opaque bar above the header, and neither is in the code.

## Summary of Changes

`Header` returns a fragment when pinned: a one-row `<header>` carrying the gate mark, the name and the balance, and a sibling `div` holding the track and any coverage reading. Siblings rather than nesting, because a sticky element holds only while its own parent is in view — nested, the row would unstick as soon as the header box scrolled past. The unpinned render is byte-identical to before.

`Balance` gained an `inline` layout: floppy, figure and unit on one bordered row, with the word kept as `sr-only`. The change pill, the preview and the lagging figure all still work. `Balance.spec.tsx` is new; the primitive had no spec of its own.

Prep and the poll now pin. The poll's coverage panel lost its `lg:top-4` pin so the question is not squeezed between three pinned edges.

ADR-132 amended in place: decision 1 rewritten on both clauses, decision 3 corrected (its `--nav-seat` contract never shipped), decision 7 added for the compact balance.
