---
# DVTD-rge1
title: The Dex reads as a list beside a detail panel
status: completed
type: feature
priority: normal
created_at: 2026-09-29T13:08:55Z
updated_at: 2026-09-29T13:40:08Z
---

**What:** Every Dex tab becomes a two-pane browser: a complete, filterable list on the left and the selected entry drawn in full on the right.

**Why:** A 46-card grid and a 96-row list hide the shape of a collection, and reading one entry means expanding it in place. A panel beside the list lets an entry state everything it has, including how to unlock the ones you do not hold yet.

## Done when

- [x] Every tab arrives showing all of its entries, with nothing truncated
- [x] An exclusive filter row narrows the list, with "all" checked on arrival
- [x] Pressing a row draws that entry in full beside the list
- [x] An entry you have not earned states its unlock paths in that panel
- [x] The panel is headed by the thing's own name, and by its id where it has one
- [x] The two panes stack on a phone, detail below the list

## Notes

Mock came from Marciano, 2026-09-29. Two things in it were dropped for having no
producer: an install count, and a first-seen-in-a-shop provenance (that ledger is
DVTD-s5vo). Configs stay binary, granted or locked.

Planning decisions: no invented numbering; the grouping axis becomes a filter on
every tab, replacing DVTD-7900's category folding a day after it landed.

Supersedes parts of ADR-120 and ADR-108. New ADR-151.

## Summary of Changes

New `DexBrowser.ui.tsx` is the two-pane chrome for all six tabs: the existing `DexPanel`
on the left with a filter row above its rows, a `Panel` on the right headed by the picked
entry, stacked below `lg` with the panel second and sticky above it.

`Panel.Row` gained a press arm (`onPress` + `picked`, rendering a button with
`aria-current` and a ring) beside its div and anchor. `SegmentedItem` gained `mark`, a
leading badge, so a chip reads `[1] 5 of 19`.

All six `Dex*.ui.tsx` rewritten as list + panel. Every row id is a string, so
`Dex.component.tsx` holds selection and filter as two `Partial<Record<DexTabId, string>>`
instead of six states. Each `dex*For` viewmodel now takes the filter and the selection and
returns rows, chips, the picked id and the panel's contents; a pick that does not survive a
filter falls back to the first row shown, so nothing resets it.

Deleted: the per-card disclosure on the configs and polls tabs, `DEX_CARDS_OPEN` and
`DEX_GROUPS_OPEN`. Run rows gave up their `href` to the panel. `formatDexNumber`, written
for the polldex and never rendered, now heads the polls panel.

Docs: ADR-151, the ADR index (108 and 120 rows amended), wiki §6.4 rewritten, CHANGELOG,
and a supersession note on DVTD-7900.

Verified: `npm test` 4986 passed / 4 failed (all four pre-existing in look.model and
look.service, untouched here); `npm run lint` clean (two pre-existing warnings),
dependency-cruiser 891 modules with no violations, wiki in sync; `tsc --noEmit` clean.

## Deferred

The mock's `installed ×4` and `first seen <shop>` were not built: no install count is
recorded and the reveal ledger is DVTD-s5vo. Swatches and runs have no filter axis worth
having, so their chip row is absent rather than holding a lone `all`.
