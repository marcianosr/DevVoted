---
# DVTD-7mpp
title: Prep asks for one thing, and offers the rest
status: completed
type: task
created_at: 2026-09-14T14:23:32Z
updated_at: 2026-09-14T14:23:32Z
---

Prep's objectives panel rendered the clear, the swatch and the gate's authored
objective as three identical rows with identical dashed checkboxes, so all three
read as gate requirements. Only the clear is required.

## Todo

- [x] Objectives splits into a required hero and an optional list
- [x] The required line is stated, not listed, and explains itself in answers
- [x] Optional prizes take a "+" and a bare figure badge
- [x] Drop the "Three things are on the table" lead line
- [x] Specs across Objectives, bandOutcomes.viewmodel and PrepScreen
- [x] lint, tsc, tests, Storybook

## Summary of Changes

`ObjectivesProps` is now `{ required, optional, optionalLead }` rather than a
flat list, because the two shapes genuinely differ: the required one is a
sentence with an explanation, the optional ones are compact rows.

**The required line reads "to clear the gate / Finish at [OK] or better"** with
a new `clearExplainFor` sentence under it: the percentage, the answers that
reach it from where the window opened, and what staying under it shuts. Its
three branches are derived, not authored: already held, N of 5 right, or "which
5 of 5 right no longer reaches".

**Optional rows carry a "+" and a bare badge.** The `lead`/`trail` words are the
required line's; in a row that already holds a name and a detail they only push
the detail onto a line of its own, which is exactly the alignment the mock
fixes. `Mark` keeps met/lost/open, so live state survives: "+" is the resting
glyph, a tick replaces it once won, a cross once unreachable.

The clear carries no mark while unmet (a hero line with an empty box beside it
reads worse than none) and ticks once held.

## Not built

- The mock's "1 required · 2 optional" header count, skipped by request.
- The mock's "neither required" reads wrong at any count but two, so the label
  is "also on the table, not required".
- The panel keeps the title "Objectives and rewards", not the mock's
  "objectives": it still holds the coverage bar and the five-band payout table,
  so the shorter title would be less accurate than what is there today.
- The mock's "+6 KB" on Smoke test has no backing data; `GateObjective` carries
  no reward field. Each optional row shows its own requirement figure instead.
- `GateObjective.lead` and `.trail` are now unrendered (the figure alone shows).
  Authored content left in place rather than deleted.

## Verification

Objectives.spec 12/12, bandOutcomes.viewmodel.spec 28/28, PrepScreen.spec 48/48.
`npm test` 4389 passed, 6 skipped, 2 todo, with only the 2 pre-existing
gate.model.spec "floor rule" failures. `npm run lint` clean, depcruise 0
violations across 990 modules. `npx tsc --noEmit` 0 errors. Checked in Storybook
at the calibration gate.
