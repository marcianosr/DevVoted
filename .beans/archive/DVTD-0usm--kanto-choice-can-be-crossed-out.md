---
# DVTD-0usm
title: Kanto Choice can be crossed out
status: completed
type: task
priority: normal
created_at: 2026-09-14T09:28:12Z
updated_at: 2026-09-16T18:55:22Z
---

The kanto Choice has no crossed-out state, so ESLint/Stylelint's eliminated wrong answer renders identically to a live one. Add the struck state to Choice.ui plus a Storybook item showing the red line.

## Summary of Changes

- `Choice.ui.tsx` gains `crossedOut`: the answer text is wrapped in `line-through decoration-cinnabar decoration-2`, the row takes `cursor-not-allowed opacity-50`, the press is `disabled`, and an `sr-only` "ruled out" rides along so the strike is not purely visual. The prop union refuses `crossedOut` on a sealed Choice (no text to strike).
- `Choice.stories.tsx`: `CrossedOut` (single row, press refused) and `Linted` (the poll with C struck). The `Poll` helper takes `struck`.
- `Choice.spec.tsx`: 4 tests (red line, unstruck by default, press refused, screen-reader cue).

## Deferred

`PollView.optionsOf` still ignores `view.disabledOptionIds`, so Kanto/Configs/ESLint > AWrongAnswerIsGone shows no change after the lint. Wiring it needs a call on seal-vs-strike precedence.

## The deferred item is resolved (2026-09-16)

The Deferred note above said `PollView.optionsOf` still ignored
`view.disabledOptionIds`, so the ESLint story showed no change after a lint, and
that wiring it needed a call on seal-vs-strike precedence.

**That call has been made and the wiring landed.** `PollView.component.tsx:61`
tests the sealed branch first and only the non-sealed branch takes
`crossedOut: view.disabledOptionIds.includes(option.id)` (`:77`), so a redacted
option is never also struck. The reason is recorded at `paidAction.model.ts:26`:
`disabledOptionIds` ships to the client, so crossing out a sealed option would
state that it is wrong, which is the leak the redaction exists to prevent.
`wrongStillOn` filters the sealed set for the same reason, and the `Choice` prop
union makes violating the precedence a type error.

Chain verified: `spendLint` writes `manualDisabled` → `toRunView` maps it to
`disabledOptionIds` (`runView.viewmodel.ts:475`) → `optionsOf` → `Question.ui`
→ `Choice.ui` strike plus `disabled`. Regression spec at `PollView.spec.tsx:247`.

Nothing left open. One cosmetic note for whoever next touches it: the story name
`AWrongAnswerIsGone` now reads slightly off, since the answer is struck rather
than gone.
