---
# DVTD-n26h
title: 'Kanto review screen: the assertion diff'
status: completed
type: feature
priority: normal
created_at: 2026-09-11T09:28:21Z
updated_at: 2026-09-11T09:37:03Z
---

The screen behind the "Review answers" button that both gate screens wire to noop. One
fold per poll: fumbles open on arrival, passes folded and dimmed. An open row is an
assertion diff — Expected over Received, lettered chips, round for single-answer and
square for multi — with the snippet and explanation beside it and the distractors folded.

A PORT, not a design: src/modules/run/run/presentation/AnswerResults.ui.tsx (old-theme)
already implements the rules, and docs/wiki.md:1043 states them as law.

Kit only — no route, no .component.tsx. /run/review keeps rendering the old-theme RunReview.

## Todo

- [x] Verdict: PARTIAL becomes PART (+ spec, story, wiki debrief bullet)
- [x] Choice gains the round/square cap axis; Question passes answerType down
- [x] Fold gains lead + heading (gate-clear specs must pass UNMODIFIED)
- [x] OptionChip + story + spec
- [x] AnswerDiff + story + spec
- [x] GateAnswer widened; one fixture backs both screens
- [x] ReviewScreen + stories + spec
- [x] Wiki + CHANGELOG

## Summary of Changes

Kit only, as scoped: no route, no .component.tsx; /run/review still renders the old-theme RunReview.

**New in src/ui/kanto-theme:** `OptionChip.ui` (lettered pill, round cap for single-answer and square for multi, outline vs filled), `AnswerDiff.ui` (Expected over Received, the multi-answer tally, distractors in a Fold) and `ReviewScreen.ui` itself.

**Changed:** `Verdict` says PART, not PARTIAL. `Choice`'s keycap gained the same round/square axis and `Question` passes `answerType` down, so the wiki's "the shapes you answered with" is now true rather than aspirational. `Fold` gained `lead` (a Verdict between the caret and the title) and `heading: "row"` (prose weight for a question) — both additive: `Fold.spec` and `GateClearScreen.spec` passed unmodified before I added new cases.

**One fixture, two screens.** `GateAnswer` widened with `answerType`, `options`, `picked`, `correct`, `explanation`, `codeBlock`, `note`, and the five Lavender polls now carry real option sets. The TypeScript poll became the mock's multi-answer partial, so the debrief's tally moved from "4 passed · 1 failed" to "3 passed · 1 part · 1 failed" and its coverage total from +58.0% to +50.6% — which also moved the gate-hold shortfall from 2% to 9.4%. Flagged in the plan before starting; the specs were updated, not the numbers.

**Known gap left open:** the "ESLint crossed out text-align on this poll · 16 KB" line renders from a `note` prop and has no domain backing — `manualDisabled` is wiped inside `applyAnswer` on the same answer, and `window.linted` is a count with no poll or option attribution. Making it real needs a field written in `answeredPollFrom` before the wipe.

**Verified:** 4295 tests pass (241 files, 6 skipped, 2 todo), lint clean bar one pre-existing warning in `Screen.stories.tsx`, dependency-cruiser finds no violations across 976 modules, `npm run build` succeeds.
