---
# DVTD-v90t
title: 'Prep screen: polls split, coverage target and a redacted categories row'
status: completed
type: task
priority: normal
created_at: 2026-09-03T19:36:22Z
updated_at: 2026-09-03T19:58:45Z
---

Mock-driven additions to the prep screen's requirements list (live playtest).

- [x] Polls row reads "answer all 5" with the window's single/multiple split under it
- [x] Coverage row keeps the target reading plus the spillover bar
- [x] Categories row shows the draw, or ??? while nothing in the build reads it
- [x] Prefetch section folded into that row (next gate included)

## Summary of Changes

Domain: `answerTypesFor(polls, fromIndex)` in `run.model.ts` counts the window's single vs multiple polls (3 tests in run.model.spec.ts). `RunView.answerTypesThisGate` carries it; the window is `windowStartIndex(state)`, the same slice the budget uses.

UI: `PrepScreen.required` is now `{ polls: { reading, note? }, coverage, categories?, nextCategories? }`; the standalone `prefetch` prop and its Prefetch section are gone. A missing categories list renders `Redacted` (???), which is the state whenever no config reads the draw.

Note: the answer-type split is shown unconditionally. It is a different axis from the categories, which stay Prefetch's product.

## Follow-up: poll type is its own redacted line

The single/multiple split moved off the Polls row onto a `Poll type` row that reads `???`. Nothing reveals it, so the split is not computed at all: `answerTypesFor` and `RunView.answerTypesThisGate` were removed rather than left as tested code nothing calls, and the withholding happens in the viewmodel layer, never as hidden markup. The seam that stays is `PrepScreenProps.required.pollTypes?: string`, documented by the BeforeElite story.

Open question for whoever ships the reveal: `.length` already reads this same window for its pick budget, so it is the natural owner — a window's pick budget minus its poll count already implies most of the split.
