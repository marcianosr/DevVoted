---
# DVTD-0usm
title: Kanto Choice can be crossed out
status: in-progress
type: task
priority: normal
created_at: 2026-09-14T09:28:12Z
updated_at: 2026-09-14T09:32:22Z
---

The kanto Choice has no crossed-out state, so ESLint/Stylelint's eliminated wrong answer renders identically to a live one. Add the struck state to Choice.ui plus a Storybook item showing the red line.

## Summary of Changes

- `Choice.ui.tsx` gains `crossedOut`: the answer text is wrapped in `line-through decoration-cinnabar decoration-2`, the row takes `cursor-not-allowed opacity-50`, the press is `disabled`, and an `sr-only` "ruled out" rides along so the strike is not purely visual. The prop union refuses `crossedOut` on a sealed Choice (no text to strike).
- `Choice.stories.tsx`: `CrossedOut` (single row, press refused) and `Linted` (the poll with C struck). The `Poll` helper takes `struck`.
- `Choice.spec.tsx`: 4 tests (red line, unstruck by default, press refused, screen-reader cue).

## Deferred

`PollView.optionsOf` still ignores `view.disabledOptionIds`, so Kanto/Configs/ESLint > AWrongAnswerIsGone shows no change after the lint. Wiring it needs a call on seal-vs-strike precedence.
