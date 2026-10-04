---
# DVTD-ggax
title: Objectives rows join the panel stack
status: completed
type: task
created_at: 2026-09-14T10:54:38Z
updated_at: 2026-09-14T10:54:38Z
---

The two objective rows were the last inset box inside the Objectives and
rewards panel: `Panel > PanelTable > rows`. Make them full-bleed rows so the
whole panel reads as one continuous stack.

## Todo

- [x] Objectives returns PanelV2.Rows / PanelV2.Row
- [x] BandOutcomes: lead and bar in their own bodies, objectives between them
- [x] Objectives.stories wraps in a PanelV2
- [x] spec, lint, build green

## Summary of Changes

`Objectives` no longer renders a panel of its own. It returns a
`PanelV2.Rows` region, so it must be a DIRECT child of the surrounding PanelV2,
never inside a Body (a Body's px-4 would inset the rules).

Its old row class was `${TABLE_ROW} items-center gap-3` =
`flex w-full px-4 py-2 items-center gap-3`, byte-identical to what
`PanelV2.Row` already sets, so the rows dropped straight in with no visual
change beyond losing the inset box.

`Requirement` keeps its own `ml-auto` rather than moving to `Row`'s `trailing`
slot: `REQUIREMENT` carries `flex-wrap justify-end` that the trailing slot does
not, and long requirement text ("reach OK or better") depends on it.

`BandOutcomes` now reads, with every band full width:

    Header
    Body    lead
    Rows    objectives
    Body    coverage bar
    Columns band / coverage / pays
    Rows    the five outcomes
    Footer  the note

The lead and the bar each got their own Body because the objectives band sits
between them and has to reach the panel edges.

## The spec pattern, now three times

`Objectives`, `BandOutcomes` and (earlier) `Ledger` all had a test counting
`.border-t` and expecting rows-1, because the old code withheld the divider
from the first row. `PanelV2.Row` instead gives EVERY row `border-t` and
cancels the first with `first:border-t-0`. jsdom applies no Tailwind, so the
count is now rows, not rows-1. Each test asserts the class pair instead.

## Worth knowing

`npx tsc --noEmit` did NOT catch a missing `PanelV2` import in
`Objectives.stories.tsx` — stories are excluded from the typecheck. Only
`npm run lint` (oxlint react/jsx-no-undef) caught it. Lint is the gate for
story files.

## Verification

- Objectives + BandOutcomes + PrepScreen + NewRunScreen specs: 97/97.
- `npm test` — 4305 passed, 6 skipped, 2 todo; the usual 4 pre-existing.
- lint clean, lint:arch no violations, tsc 0 errors.
