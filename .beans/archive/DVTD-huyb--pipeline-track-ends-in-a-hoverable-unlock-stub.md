---
# DVTD-huyb
title: Pipeline track ends in a hoverable unlock stub
status: completed
type: task
priority: normal
created_at: 2026-08-28T07:48:33Z
updated_at: 2026-08-28T07:53:56Z
---

Follow-up to DVTD-voxv, same playtest loop: on a full pipeline the track just stopped, because the room-still-to-be-earned wore `border-transparent bg-zinc-900/60` and was invisible against the surface.

- [x] The tail is now a dashed stub **one spot wide**, whatever the ladder still owes, in `border-zinc-600` with a hover brighten.
- [x] Hovering it says "Clear gates to unlock more spots".
- [x] The track is scaled to the capacity the run HAS (plus the stub's one spot), not out to `maxSpots`. `maxSpots` now only decides whether the stub appears.
- [x] `Tooltip` gained `align="right"`, since a panel hanging left off the last cell in a 384px column opens off the edge.

## Summary of Changes

`SpotTrack.ui` — `UNGRANTED` is dashed and visible; the stub is its own `Segment` branch, wrapping the cell in a `Tooltip` (width on an outer span, trigger filling it via `className={FILL}`, so the whole stub is the hover target). `Cell` gained `hint?`, set only on the stub. Width denominator is now the sum of the cells drawn.

`Tooltip.ui` — `align?: "left" | "right"`, `left-0` moved out of `PANEL` into an `ALIGN` map. New `AlignedToEitherEdge` story.

**Copy: "spots", not "units".** Marciano wrote "Unlock more units (units?) when playing runs!" with the word in doubt; `spot` is the established term (wiki glossary, every caption), and coining a second word for the same thing is what [[avoid-new-vocabulary-words]] exists to stop. "Clear gates" rather than "playing runs" because gate clears are literally the only source of the room this stub stands for — the rented rungs past a byte are a different mechanic and the stub is never drawn for them.

**Tradeoff accepted:** the track no longer draws unearned room to scale, so "4 spots" no longer reads as visibly half a byte. That was the original reason for `maxSpots`, and it cost half the width of everything the player actually owns to say something they cannot act on. The stub plus its hint carry it instead.

## Verification

`npm run lint` clean (786 modules, 3240 deps) · `tsc` clean · `npm test` **2554 passed, 3 failed** — the three are the documented `RewardScreen` baseline (DVTD-9dn0). Stories: 27 errors, the same 27 in DVTD-a8tr, none new.

## Follow-up in the same turn: grade colour on the track bars

Marciano: "Bring back tha rarity chip colors here aswell" — the bars in the pipeline track were still neutral.

- `SpotTrackConfig` gained `rarity?: Rarity`. **Passed, never derived from `spots`** — a minified byte occupies four spots and is not a nibble.
- `INSTALLED` / `MINIFIED` use `border-current` and the label dropped `text-zinc-300`, so one tone class colours the outline and the name. No fill tint: the track's fills already mean installed / free / over-capacity, and a grade tint would compete with them.
- `OVERFLOW` replaces the grade colour rather than joining it (a state outranks a grade), and now carries `text-cinnabar` so the label goes with it.
- `trackBars` in ShopView, the legacy shop and ConfiguringScreen pass `rarityOf(config)`; StartScreen and PrepScreen already had `rarity` on their own row types and needed no change.
- `UNGRADED` (`text-zinc-400`) is the fallback for a caller that does not know the grade.

ADR-043's amendment and the wiki now say the grade colours four marks — glyph, cells, word, track bar — and never a row wash.

Re-verified: lint clean, `npm run build` clean, **2556 passed / 3 failed** (same `RewardScreen` baseline), story errors still 27.
