---
# DVTD-l6dv
title: Review screen stands its folds on the page
status: completed
type: task
priority: normal
created_at: 2026-09-14T12:12:00Z
updated_at: 2026-09-14T12:13:53Z
---

The review screen is the last kanto run screen still inside a framed Screen. Its
poll rows are already panels, because Fold wears PANEL_V2_SURFACE since DVTD-o91z,
so this is the ground and the footer, not the rows.

## Todo

- [x] ReviewScreen takes ground, defaulting to "bare"
- [x] ScreenFooter moves into a headerless PanelV2 with rule={false}
- [x] A spec pins the shed frame
- [x] lint, tsc, tests

## Summary of Changes

Two lines and a spec. The rows needed nothing: `Fold` has worn
`PANEL_V2_SURFACE` since DVTD-o91z, so every poll was already a panel sitting
inside a second, larger frame.

`ReviewScreen` gained `ground`, defaulting to `"bare"`, and its `ScreenFooter`
moved into a headerless `PanelV2` with `rule={false}`, matching new run, prep,
poll, gate outcome and shop.

The control row (`fumbles open, passes folded` + `open everything`) stayed
loose on purpose: it is a toolbar acting on the panels below it, so it belongs
with the header rather than in a box of its own.

## Verification

ReviewScreen.spec 17/17 (2 new). `npm test` 4311 passed, 6 skipped, 2 todo, with
only the 2 pre-existing gate.model.spec "floor rule" failures. `npm run lint`
clean, depcruise 0 violations across 986 modules. `npx tsc --noEmit` 0 errors.
