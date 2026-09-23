---
# DVTD-k9ij
title: Build space rents from the Boulder shop, one gate earlier
status: completed
type: task
priority: normal
created_at: 2026-09-22T07:30:38Z
updated_at: 2026-09-22T07:30:38Z
parent: DVTD-cb52
---

`BUILD_SPACE_FROM_GATE` 2 → 1. The first shop a run reaches — the one that stocks
Boulder — now rents.

## Why

ADR-082 D5 held the picker back to the Cascade shop so "the first two gates are the
same for everyone". That made the *first* shop a shop with nothing to decide: the
ladder is its second lever beside the registry, and withholding it only delayed the
choice it exists to pose. Pallet stays shared — it is the calibration gate
(ADR-057), and a run has earned little to spend there anyway.

## Summary of Changes

- `rules.model.ts` — `BUILD_SPACE_FROM_GATE = 1`.
- `newRunScreen.viewmodel.ts` — `NEW_RUN_BUILD_NOTE` derives the gate name from the
  constant instead of hardcoding "Cascade".
- ADR-082 D5 amended with the date and the old value; wiki (4 passages + the
  constants table); CHANGELOG's unreleased build-space entry.
- Threshold specs rewritten off `BUILD_SPACE_FROM_GATE` rather than literal gate
  numbers, so the next move needs no spec edits.

The locked panel added in DVTD-2j1h still has a case to draw: `gatesCleared`
advances only on a clear (`answer.model.ts:335`), so a run that **held** Pallet
shops for its retry with the ladder shut.

Verified: `npm test` 217 files / 3973 passed / 0 failed; `npm run lint` clean;
`npm run build` clean.
