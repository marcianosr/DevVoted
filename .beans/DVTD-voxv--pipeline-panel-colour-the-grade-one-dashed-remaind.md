---
# DVTD-voxv
title: 'Pipeline panel: colour the grade, one dashed remainder, drop the double header'
status: completed
type: task
priority: normal
created_at: 2026-08-28T07:16:35Z
updated_at: 2026-08-28T07:32:01Z
---

Six changes from playtest feedback on /proto-run (2026-08-28).

- [x] Delete SpotTrack's own header row ("3 configs | 4 spots · 6 at gate 3") — the Fold above it already carries "4 of 14 spots". Drops `lead`/`note` from SpotTrack, and with them the widening note, so `nextSpotGrant` leaves the modern Start/Prep screens.
- [x] Caption reads "10 spots free · a byte fits" (was "a byte fits · …", no free count).
- [x] Free room draws as ONE dashed region, not one dashed cell per spot; same for ungranted room. The count moved to the caption.
- [x] Hovering a config's grade mark states the space it takes: "4 of 14 spots". New `gradeHint` on Pick and Entry.
- [x] Rarity gets colour back: grey/blue/purple/gold on the cells, the glyph and the grade word. Partly reverses ADR-043 — needs an amendment line there.
- [x] Cells go back to their old size (size-1.5, not size-2).
- [x] Drop "0 / 13" beside the gate name on the New run screen; `gateNumber`/`gateCount` leave StartScreen.

## Summary of Changes

**Kit**
- `rarity.ts` — new `RARITY_TONE` (bit pewter, crumb cerulean, nibble lavender, byte saffron). Cinnabar and celadon deliberately excluded: they mean refusal and recommendation elsewhere in the kit.
- `RarityGlyph.ui` — glyph and cells both take `RARITY_TONE[rarity]`; cells back to 6px (`size-1.5`, `gap-[2px]`, box `w-16`), `bg-current` so one class colours the run.
- `RowFigures.ui` — grade word tinted on the wrapper with `tone="inherit"` inside, since a tone plus a colour class on one element is settled by Tailwind source order.
- `Pick.ui` / `Entry.ui` — new `gradeHint`, wrapping the mark in a Tooltip: "takes 4 of 14 spots".
- `SpotTrack.ui` — header row deleted with `lead`/`note`; free room and ungranted room each draw as ONE region; caption is now `10 spots free · a byte fits`.

**Screens**
- `StartScreen` — "0 / 13" gone (with `gateNumber`/`gateCount`), `nextSpotGrant`/`StartSpotGrant`/`wideningNote` gone, `gradeHint` on every deal row.
- `PrepScreen` — same removals (`PrepSpotGrant`).
- `ShopView` + legacy `ShopScreen` — track loses `lead`/`note`; both shelf and pipeline rows gained `gradeHint`.
- `StartView` / `PrepView` — stop passing what the screens no longer take; `GATE_COUNT` import dropped.

**Docs**
- ADR-043: inline markers on Decisions 2 and 4, plus an amendment section. Its own last Consequence bullet predicted this playtest failure and ruled out a legend; the fix taken is colour, the word and a hover, not a legend.
- wiki §4.2 rewritten (also fixed the stale "size IS the price, 64/128/256/512 KB", which ADR-044 had already reversed), §8 Rarity bullet, §6 Dex line.
- CHANGELOG: the two unreleased entries that claimed rarity is achromatic edited in place.

## Verification

`npm run lint` clean (786 modules, 3239 dependencies) · `npm run build` clean · `npm test` **2551 passed, 3 failed** — the three are the documented `RewardScreen` copy baseline (DVTD-9dn0). Stories checked with a temporary tsconfig clearing the `*.stories.tsx` exclusion: 27 errors, the same 27 already tracked in DVTD-a8tr, none new.
