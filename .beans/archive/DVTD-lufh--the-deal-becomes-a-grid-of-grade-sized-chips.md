---
# DVTD-lufh
title: The deal becomes a grid of grade-sized chips
status: scrapped
type: feature
priority: high
created_at: 2026-08-27T20:20:07Z
updated_at: 2026-08-27T22:45:40Z
---

Marciano: *"instead having the list items here, I would like to see back the chips but when in nibble/byte etc sizes, in a grid."*

The deal is currently one `Pick` row per config, all the same height whatever the config costs. He wants chips again, sized by grade, packed into a grid — so the deal reads as a shape-packing problem, which is what ADR-044 made it.

## The shape mapping is already decided

`RarityGlyph`'s `CELLS` (ADR-043) lays each grade out as a rectangle:

| Grade | Glyph cells | Tile span |
| --- | --- | --- |
| bit | 1 | 1 × 1 |
| crumb | 2 side by side | 2 × 1 |
| nibble | 2 × 2 | 2 × 2 |
| byte | 4 × 2 | 4 × 2 |

So a 4-column grid gives every tile the shape of its own mark, scaled up. Nothing invented: the tile IS the glyph.

`grid-flow-row-dense` so small tiles backfill, and items sorted biggest-first so a late byte does not punch a hole above itself.

## The trade-off, stated

A chip has no room for a sentence, so the facts line and the explainer move from an inline disclosure into a hover tooltip — which is what the shop's chips already do. Name, glyph and rate stay on the face, so the essentials need no hover. Keyboard and touch reach the tooltip by focus; that is worse than a disclosure and is the price of the layout.

## Todo

- [ ] `ChipGrid.ui.tsx`: the grid, and a grade-sized chip
- [ ] Spec + story
- [ ] StartScreen: the deal's rows become the grid
- [ ] StartView: facts + explainer into the tooltip
- [ ] Rewrite the deal-row specs
- [ ] lint, build, test

## Reasons for Scrapping

Built, shown, and reversed inside the session: *"Nah, replace the grid again with this tight list."* `ChipGrid.ui.tsx`, its spec and its stories are deleted rather than left as an unused kit component.

What the grid got wrong, judging by the list that replaced it: **area is a bad axis for comparison.** A 2x2 nibble beside a 4x2 byte tells you they differ but not by how much without doing geometry, and tiles of different heights cannot share a column, so the rate and the grade had nowhere consistent to sit. The list keeps one scan line per config and puts the size in a column, where four widths compare straight down.

It also cost the disclosure. A tile has no room for a sentence, so the facts line and the explainer had to move to a hover tooltip; that was the trade flagged going in, and it turned out to be the expensive half.

## What survived into the tight list

The shape idea survived in a better form: **the grade drawn as a run of cells** in a fixed column. `RarityCells` reuses `RarityGlyph`'s own `CELLS` map for the count, so the two layouts cannot disagree about what a nibble is. The cluster is the mark beside a name; the line is the mark in a column you scan.

`Tooltip`'s new `className` is the other survivor: nothing uses it now, but it is the fix for any trigger that has to fill its own cell.
