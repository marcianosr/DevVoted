---
# DVTD-1gl6
title: The rewards table is a PanelV2, not a nested table
status: completed
type: task
created_at: 2026-09-14T10:48:15Z
updated_at: 2026-09-14T10:48:15Z
---

The rewards table (band / coverage / pays) was still a `PanelTable` box nested
inside its PanelV2. Give PanelV2 a columns region so the table IS the panel.

## Todo

- [x] PanelV2.Columns: the raised heading row PanelTable drew
- [x] PanelV2.Row takes theme + className, for the DANGER band
- [x] BandOutcomes uses Columns + Rows, PanelTable gone from it
- [x] PanelTable bleed variant reverted (no user left)
- [x] specs, lint, build green

## Summary of Changes

`PanelV2.Columns` takes `readonly PanelV2Column[]` ({label, width}) and renders
the `bg-theme-raised border-b` heading row, lifted verbatim from PanelTable's
HEADINGS. `BandOutcomes` now reads:

    Header -> Body (lead, objectives, bar) -> Columns -> Rows -> Footer

with no inner box, so the headings and every band rule reach the panel edges.

`PanelV2.Row` gained `theme?: KantoColor` (the DANGER band sets its own
`data-screen-theme` so its badges go red) and `className?: string` for the fatal
left bar. Same contract as the panel root: utilities the row does not already
set. The row's old `items-baseline gap-4` was dropped rather than passed through
className, because overriding `items-center gap-3` that way is unreliable with
no tailwind-merge (see the conflicting-utilities note).

`Outcome`'s `first` prop retired: `PanelV2.Row` draws its own rule and cancels it
on the first with `first:border-t-0`.

**The `bleed` variant I added to PanelTable an hour ago is reverted.**
BandOutcomes was its only "sides" user, and keeping it would have been exactly
the dead configuration just deleted from Ledger.

## Two spec fixes, both real structure changes

1. `BandOutcomes` "rules between the outcomes but not above the first" counted
   `.border-t` and expected rows-1. Every PanelV2.Row now carries `border-t`
   AND `first:border-t-0`, so the count is rows and the first cancels itself in
   CSS. jsdom applies no Tailwind, so the test asserts the class pair instead.
2. `PrepScreen`'s `outcomeTable()` walked from the "band" heading to its
   `parentElement`, which used to be the PanelTable box holding both headings
   and rows. The rows are now a SIBLING of the headings, so it walks to
   `nextElementSibling`. Without it the helper returned the whole panel and
   matched "OK" twice (the lead line has an OK badge too).

## Still on Panel (V1) — not done here

Component call sites: CommunityScreen, ConfigInfo, CodeBlock, GateChoice,
GateOutcomeScreen, Objectives, Upgrades, PollResult.

Chrome-STRING consumers, which cannot take the component because they render a
different element: `Fold` (details), `PollResult` (details), `Modal` (dialog).
These are why PANEL_CHROME/PANEL_SURFACE exist. Migrating them means exporting
PanelV2's surface as a string too, and PanelV2 has no padding, so each would
have to pad its own regions.

`PanelTable` still serves Ledger, LedgerRows and Objectives.

## Verification

- BandOutcomes + PrepScreen + PanelV2 specs: 74/74.
- `npm test` — 4305 passed, 6 skipped, 2 todo; the usual 4 pre-existing.
- lint clean, lint:arch no violations, tsc 0 errors.
