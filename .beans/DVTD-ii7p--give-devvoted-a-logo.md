---
# DVTD-ii7p
title: Give DevVoted a logo
status: completed
type: feature
priority: normal
created_at: 2026-09-27T17:32:46Z
updated_at: 2026-09-27T17:46:00Z
---

**What:** A dashed-square mark beside the lowercase word devvoted, built as a reusable brand lockup and shipped as the site icon set.

**Why:** The game has no logo at all, the browser tab is blank, and the page already asks for five icon files that were never made.

## Done when

- [x] The lockup renders at three sizes with the mark centred on the word
- [x] The two brand colours are named tokens, not literals in a component
- [x] The tab shows an icon that stays legible down to the smallest size
- [x] The page stops asking for icon files that do not exist
- [x] The word appears at the left edge of the top bar and leads home
- [x] The brand keeps its own colours instead of following the screen theme

## Notes

The mark is a dashed cell on purpose: the style guide already reserves dashed edges for
"an empty spot you can fill right now", so the brand reads as an empty slot, which is the
thing the whole run is about filling.

Measured from the supplied mock: monospace bold at ~20px, 12px glyph advance, a 26px
square at 2px stroke with a 6px radius, two dashes per side, 13px of air before the word.
The face is already the body default, so no new font ships.

Colour is two new brand tokens rather than an existing rung. Every faint rung pins chroma
at 0.05 and the mock sits at 0.021, so no existing colour reproduces it. Consequence
accepted deliberately: the brand does not repaint per screen theme.

Deferred, wants its own bean: the top bar is still raw markup inside the route file with
hardcoded greys, which breaks the two-tier rule. This adds one link to it and leaves the
rest alone.

## Summary of Changes

The lockup is a mark drawn as inline vector art beside the word, both sized from one type
scale so the whole thing grows from a single step. The mark is drawn rather than bordered
because a border gives no control over where the breaks fall, and the design wants one
break centred on each side.

The two colours are named tokens sitting beside the palette but deliberately outside it,
since the closed set of twelve drives other machinery and a brand is not a thirteenth game
colour. No existing tone could reach them anyway: every faint tone pins its saturation
higher than the brand needs.

The icon set is generated from two vector sources by a hand-run script, so the drawn mark
and the tab icon cannot drift. The smallest size drops to a filled shape because the breaks
disappear into noise below a certain size.

Verified: build clean, types clean, boundaries clean, docs in sync, 4280 tests pass. The
generated icons were decoded and inspected directly to confirm the breaks land one per side
at every size.

### Reversals worth knowing

The first attempt normalised the outline's length so one set of break values would work at
any size. The rasteriser used to generate the icons ignores that normalisation, so the tab
icon came out with fourteen breaks instead of four. Both the drawn mark and the vector
sources now carry break values computed from their own real outline length.

A parallel session rewrote the stylesheet mid-task and removed the brand colours as a side
effect of removing the skin feature. They were restored and the build re-checked to confirm
the colours reach the compiled output.
