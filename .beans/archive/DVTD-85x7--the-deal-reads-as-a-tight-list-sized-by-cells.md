---
# DVTD-85x7
title: The deal reads as a tight list, sized by cells
status: completed
type: feature
priority: high
created_at: 2026-08-28T01:26:25Z
updated_at: 2026-08-28T02:30:01Z
---

Marciano's mock (image #33), replacing the grid he had asked for one message earlier.

## What the list does that neither the old rows nor the grid did

- **The grade is a run of cells** in a fixed column, one cell per bit: `.js` one, Code Coverage two, Prefetch four, AGENTS.md eight. Widths compare straight down the list the way a bar chart does, which is the thing area could not do.
- **The last column is the grade's name** — `bit`, `crumb`, `nibble`, `byte` — not a spot count. Under ADR-044 they are the same fact, and the row already draws the cells; "4 spots" beside four cells and the word `nibble` would be the third telling of one thing.
- **Rows are ruled, not spaced**, so the columns have something to line up against.
- A config that will not fit **dims and stops responding, and says nothing extra**. The track's caption above already names the ceiling ("a nibble is the biggest thing that fits"), so a per-row refusal repeated it.

## Changes

- `RarityCells`, beside `RarityGlyph` and sharing its `CELLS` map so the count has one source. `aria-hidden`: the grade's name is in the row's own last column, and the cells would be read out twice.
- `Pick` gains `gradeAs: "glyph" | "cells"`.
- `Fold` gains `divided`, which rules rows apart instead of spacing them.
- `RowFigures` now takes `grade: Rarity` rather than `spots: number`. Its `needs` stays optional and the **shelf** still passes it: the shop has no track caption to lean on, and hover-only refusals were the complaint two messages ago.

## Note for whoever writes the ADR

This puts the grade **word** back on a row, which ADR-043 deliberately removed (it deleted `RarityWord` because the glyph stated the grade). The reversal is narrow and defensible: the word is now the *price* (ADR-044), and every refusal elsewhere is phrased in it ("needs a byte"), so the column teaches the vocabulary the rest of the game speaks. ADR-043's actual target — the four **hues** — stays deleted.

## Verification

`npm run lint` clean (786 modules, 3237 dependencies) · `npm run build` clean · every file touched this round green: **13 files, 307 tests, 0 failures**.

The full suite is not trustworthy on this machine right now. Spotlight (`mds`) is at 50% CPU beside a Virtualization VM, holding load average at 21-26, and a 40-second suite took 47 then 72 minutes, dropping 8 files and producing timeout-shaped failures (`environment 4391s`). Nothing to do with this work; re-run when the machine is idle. Last trustworthy full run in this state: 2544 passed, 3 failed (the documented `RewardScreen` baseline, DVTD-9dn0).
