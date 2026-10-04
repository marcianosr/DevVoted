---
# DVTD-9wzh
title: Swatch ladder follows Kanto's route, not badge order alone
status: completed
type: task
created_at: 2026-08-07T09:07:30Z
updated_at: 2026-08-07T09:07:30Z
---

Lavender and Seafoam were appended after all eight gym badges (gates 9-10). Both are mid-game Kanto stops, so the run finished on two landmarks you walk past before the halfway point, and the palette's two palest colours sat on the deepest gates.

Reordered so the eight badges keep strict trainer-card order and the two non-gym landmarks drop into the gaps Kanto actually walks you through.

## Summary of Changes

- `GATE_SWATCHES`: Lavender 9 to 4 (out of Rock Tunnel after Vermilion, before Celadon), Seafoam 10 to 8 (Route 20, heading for Cinnabar). Rainbow, Soul, Marsh, Volcano and Earth each shift down one. Gates 0-3 and 11-12 unchanged.
- Ladder now reads: Pallet, Boulder, Cascade, Thunder, Lavender, Rainbow, Soul, Marsh, Seafoam, Volcano, Earth, Elite, Champion.
- Two new spec cases pin it: the badges stay in trainer-card order, and the landmarks sit at 4 and 8.
- Docs: swatch.model docstring, wiki 6.4, ADR-019 consequences (two entries: why the palette is the roster's spine, and why the landmarks moved), changelog.

Safe without migration: `users.owned_swatch_ids` persists `swatch-${theme}` ids, never gate numbers. Only a run's in-flight earned-so-far set reshuffles, since that derives from `gatesCleared`.

Side benefit: the summit approach reads cinnabar, viridian, indigo instead of lavender, seafoam, indigo, so the colour ramp escalates into the Elite Four rather than cooling off.

Verified: 1173 tests pass, typecheck and lint clean, ladder checked in Storybook.
