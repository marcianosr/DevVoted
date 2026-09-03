---
# DVTD-gsr6
title: Tooltip on 'correct' chip explaining the difficulty bonus
status: completed
type: feature
priority: normal
created_at: 2026-07-24T12:45:59Z
updated_at: 2026-07-24T12:51:26Z
---

The difficulty multiplier is folded into the 'correct'/base coverage chip. Add a hover tooltip on that chip (only when the poll is harder than baseline, i.e. multiplier > 1) explaining that harder polls (more options / multiple-choice) pay more coverage. Reuse src/ui/Tooltip.component.tsx. Compact inline affordance per user preference.

## Todos
- [x] View-model: AnswerScore.difficulty + answerDifficulty() from the answered snapshot
- [x] ScoreEquationChips: DifficultyBonus prop + PlainScoreChip wraps base chip in Tooltip (dotted underline + cursor-help)
- [x] AnsweringScreen forwards revealScore.difficulty
- [x] ScoringReveal ChipEquation story now carries a difficulty tooltip (5-opt multiple, x1.7)
- [x] New ScoreEquationChips.spec.tsx (4 tests) + 2 view-model tests
- [x] targeted+full tests, oxlint+depcruise, tsc --noEmit all green (2 unrelated pre-existing UI-spec failures remain)

## Summary of Changes

- Tooltip only appears when the poll beat baseline (multiplier > 1) and only on the correct chip (base >= 0) — baseline/miss show nothing.
- Difficulty sourced from the answered-poll snapshot in latestAnswerScore, NOT view.poll (which has already advanced to the next question at reveal time).
- Reused the existing CSS-hover Tooltip (src/ui/Tooltip.component.tsx); no new tooltip infra. Compact inline affordance: dotted underline + cursor-help on the label.
- Files: runView.viewmodel.ts, ScoreEquationChips.ui.tsx (+ new .spec.tsx), AnsweringScreen.ui.tsx, ScoringReveal.stories.tsx, runView.viewmodel.spec.ts.
- Copy: "Harder polls pay more coverage — N options[, multiple-choice] (×M)."
