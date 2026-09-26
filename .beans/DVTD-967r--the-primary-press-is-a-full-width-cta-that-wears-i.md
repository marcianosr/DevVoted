---
# DVTD-967r
title: The primary press is a full-width CTA that wears its gate
status: completed
type: feature
priority: normal
created_at: 2026-09-26T06:57:28Z
updated_at: 2026-09-26T07:31:38Z
---

**What:** The press a screen is asking for becomes one full-width bar that wears the gate's colour, carries the gate's mark, and states underneath it either what it acts on or why it is shut.

**Why:** A small button in the corner of a footer does not read as the way forward, and the note explaining a refusal stands beside it where it can wrap away or scroll away from the press it explains.

## Done when

- [x] The primary press on every screen is the wide bar, live in the gate's colour and refused on the screen's own ground
- [x] The bar states its reading on a second line under the label, refused or not
- [x] Secondary exits stay small presses on a row above the bar
- [x] While a poll is open the bar holds the floor and the build sheet is seated above it
- [x] The reversed stacking order is written down where the old order was decided

## Notes

Mocks: a dashed gate mark, a bold label, a quieter reading under it, a chevron at the trailing edge.

Decided with Marciano before starting:

- Kit-wide in one pass, not poll and prep first.
- The bar takes the floor; the build sheet is seated off its measured height. This reverses the stacking ADR-114 decided, so 114 needs the amendment.
- The mark is a real swatch, so it fills once the gate is no longer the one being played.

Open while building: the bright ground breaks the swatch's `current` fill, which is built against a dark ground.

## Summary of Changes

One wide press replaces the small footer button on every screen. It carries the
gate's mark, states its reading under its label, and stands proud of the page.

- A new kit primitive with its own story set and spec: mark, label, reading,
  chevron. Live wears the theme at full brightness with the ink the kit already
  pairs to it; refused keeps the screen's own ground.
- The swatch learned to sit on a bright surface. Every fill it had was pitched
  at the near-black screen and its dashed well inverted badly; the bright set
  draws in the ink beside it instead.
- The footer's two strings resolve to one line: the press says the refusal
  while it is shut and the note while it is live, and whatever it does not take
  stands above it. A refusal no longer implies a shut press, which is what a
  retryable server error needs. The placement prop is gone.
- The stack on the poll screen turned over. The press holds the floor and the
  build sheet is seated on its measured height.
- The bar behind the press draws a ground only when it carries more than the
  press, so a lone press is not a plate around a button.
- Asides share the press's line from the small breakpoint and stack below it.
- Every screen's press now states a reading: the build it holds, the window it
  opens, the answer it commits, the polls waiting today.
- The poll panel lost its count heading; its category and shape are the header.
  The author's credit is a badge, aligned with the leader's streak below it.
- Depth: a plinth in the press's own hue and an ambient shadow, collapsing on
  press so the bar travels its own height.

Verified: 3839 tests pass, typecheck clean, lint and architecture boundaries
clean, wiki in sync, production build green.

Two things to look at rather than take on trust: the wide-screen row gives the
press the space the asides leave rather than shrink-wrapping it, and the shop's
press states its build the same way the new-run press does.
