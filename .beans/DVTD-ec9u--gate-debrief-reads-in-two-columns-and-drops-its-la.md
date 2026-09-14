---
# DVTD-ec9u
title: Gate debrief reads in two columns, and drops its last V1 panels
status: completed
type: task
priority: normal
created_at: 2026-09-14T12:39:13Z
updated_at: 2026-09-14T12:39:31Z
---

The gate debrief stacked five folds in one column. Put the score beside the
takings, with the answers across the foot, and finish the V1 -> V2 panel
migration for everything the screen renders.

## Todo

- [x] Coverage + By category left, Payout + Build changes right
- [x] The five answers spans the full width, its question rows needing it
- [x] EndingPanel leaves Panel V1 for PanelV2
- [x] GateChoice's two arms leave Panel V1 for PanelV2
- [x] Specs pin the arrangement; GateChoice's armOf rescoped
- [x] lint, tsc, tests

## Summary of Changes

`COLUMNS`/`COLUMN` replace the flat `PANELS` stack: Coverage + By category left,
Payout + Build changes right, The five answers full width beneath. The answers
panel was kept out of the grid deliberately: at ~430px a column its question
rows wrap to two or three lines each.

**The last V1 panels on this screen are gone.** `EndingPanel` and both
`GateChoice` arms wore `Panel` (V1); all three are `PanelV2` now, so nothing the
gate debrief renders is still on V1 chrome. The peel arm's owed badge became
`PanelV2.Header`'s `badge`, the refusal arm's price its `meta`.

**One false green caught.** `GateChoice.spec`'s `armOf` was
`heading.closest("div").parentElement`, which after the conversion resolved to
the whole choice rather than one arm, so `within(armOf(...))` would have passed
on text from either side. Rescoped to `closest("section")` with an explicit
throw instead of the two non-null assertions it carried.

## Verification

GateOutcomeScreen.spec 41/41 (2 new), GateChoice.spec 17/17. `npm test` 4313
passed, 6 skipped, 2 todo, with only the 2 pre-existing gate.model.spec "floor
rule" failures. `npm run lint` clean, depcruise 0 violations across 986 modules.
`npx tsc --noEmit` 0 errors.
