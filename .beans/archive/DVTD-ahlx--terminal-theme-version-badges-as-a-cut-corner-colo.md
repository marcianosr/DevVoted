---
# DVTD-ahlx
title: 'Terminal-theme: version badges as a cut-corner colour ramp'
status: completed
type: task
priority: normal
created_at: 2026-09-01T16:47:20Z
updated_at: 2026-09-01T17:11:26Z
---

Restyle Version.ui.tsx to the badge ladder in the mock: one octagonal
cut-corner chip per rung, filled on a ramp from near-black green at v1 to
pallet at v5.

Replaces the current mix of plain text (v1), bordered box (v2/v3) and filled
box with an outline ring (v5).

- [x] Version.ui.tsx: octagon clip-path, five filled rungs
- [x] Version.stories.tsx: ladder on the zinc-950 ground the mock uses
- [x] lint + typecheck

## Summary of Changes

`Version.ui.tsx` is now one shape at every rung: an octagon cut 5px off all four corners, filled, no border and no outline (both would be sliced through by the clip-path).

Ramp: v1 viridian/20 on celadon text, v2 viridian/35, v3 viridian/60 on pallet text, v4 celadon/80 on zinc-950, v5 pallet on zinc-950. The text flips dark at v4 where the fill outruns it.

The old ladder mixed three treatments — plain text at v1, a bordered box at v2/v3, a filled box plus an offset outline ring at v5 — so a rung changed shape as well as weight. Now only the colour moves.

Picks up automatically in ShopScreen, PrepScreen, GateHoldScreen and NewRunScreen, which all render `<Version label={row.version} />`.

## Revision: monochrome, not viridian

First pass read a green cast off the mock and ramped through viridian/celadon. Marciano called it: the ladder is monochrome.

It is also the right call independent of the mock — hue already means **family** in this theme (`families.ts`), so a green version chip reads as a focus config sitting next to a real focus config's celadon slot mark.

Final ramp, pure value: zinc-800/400, zinc-700/300, zinc-600/100, zinc-400/950, zinc-100/950.

Version.stories rebuilt around it: TheWholeLadder, TheDarkEnd (v1 and v2 are the pair most at risk of collapsing together), OnAGateWash (the cut corners only survive against a colour wash — on plain zinc the dark rungs hide their own shape), and BesideAConfig (the badge next to a family-coloured slot mark, which is the collision the monochrome ramp exists to avoid).

## Revision 2: the shape is a ladder too

Missed on the first two passes — I read all five badges as one octagon. They are not. Each rung mills off **one more corner** than the last: v1 square, v5 a full octagon.

That makes the badge carry its version twice over, in value and in silhouette, so it survives a greyscale print, a colourblind reader, and a glance down a build list.

Corner order is a diagonal first: tl, +br, +tr, +bl. A clockwise rotation would make v3 a symmetrical trapezoid, which reads as a shape rather than as a count of three.

Implemented as an inline `clipPath` composed by `outline()` from the milled set, not a Tailwind arbitrary value — the path is computed per rung and the scanner only sees class strings it can read whole in the source. Inline style for computed geometry already has precedent here (`SlotTrack` flexGrow, `Slots` width).

Added `TheShapeLadder` to the stories: all five on a flat cinnabar ground, where only the silhouette separates them.
