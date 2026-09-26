---
# DVTD-8xnw
title: 'AnswerResults: PracticeBank row style + correct/partial/wrong outcome tints'
status: completed
type: feature
created_at: 2026-07-17T10:30:45Z
updated_at: 2026-07-17T10:30:45Z
---

Per Marciano (liked the PracticeBank rows): AnswerResults restyled to the bordered divide-y row list with celadon/10 (correct), saffron/10 (partial), cinnabar/10 (wrong) backgrounds, category chip + name, question, picked answers right-aligned. Engine: AnsweredPoll.correct replaced by outcome ('correct'|'partial'|'wrong') via answerOutcome() — partial = at least one correct option picked on a multiple-answer poll without matching the exact set (over-selection also counts as partial); singles are never partial. Gate math unchanged (isCorrect stays binary).

## Summary of Changes
run.model.ts (+answerOutcome, AnsweredPoll.outcome), runView.viewmodel.ts, AnswerResults.ui/spec/stories, RewardScreen spec/stories, StripScreen stories. 722 tests green.
