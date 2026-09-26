---
# DVTD-emuh
title: Reimplement poll answering screen (Phase 1)
status: in-progress
type: feature
priority: normal
created_at: 2026-07-01T10:00:17Z
updated_at: 2026-07-01T10:13:54Z
---

Port the DevVoted Flow prototype PollScreen into the app, keeping current fonts/colors. Extract visuals into src/ui/polls/*.ui.tsx with Stories; thin domain components to composition.

## Todos
- [x] PollCategoryBadge.ui.tsx (+story)
- [x] PollMetaLine.ui.tsx (+story)
- [x] PollQuestionHeading.ui.tsx (+story)
- [x] PollOptionButton.ui.tsx (+story)
- [x] PollOptionList.ui.tsx (+story)
- [x] PollActiveConfigStrip.ui.tsx (+story)
- [x] PollSubmitBar.ui.tsx (+story)
- [x] PollAnsweringScreen.ui.tsx (+story)
- [x] Rewrite PollOptionsForm.component.tsx to compose new UI
- [x] Thin PollQuestionDisplay / PollOptions / Option components
- [x] Wire meta row + config strip in DailyPollContainer
- [x] Tests: option toggle (single/multiple), disabled, submit states
- [x] build + lint + typecheck green

## Summary of Changes

Reimplemented the poll answering screen (pre-submit) to match the DevVoted Flow prototype while keeping current fonts (Pixter/Fira) and per-category theming.

- New Tier-1 UI in src/ui/polls/: PollMarkdown, PollCategoryBadge, PollMetaLine, PollQuestionHeading, PollOptionButton, PollOptionList, PollActiveConfigStrip, PollSubmitBar, PollAnsweringScreen (+ stories, story-utils decorator).
- Lettered A/B/C full-row option buttons; single replaces, multiple toggles (toggleOptionSelection util).
- PollOptionsForm composes PollAnsweringScreen (keeps TanStack form + mutation). PollQuestionDisplay + MarkdownText delegate to new UI. Removed Option/PollOptions (+Option.spec).
- DailyPollContainer builds meta line + active-config strip (from configEffects.perConfigCoverageEffects); big header only on answered branch.
- Tests: optionSelection, PollOptionList, PollSubmitBar (15 pass). tsc/lint/build green. 9 failing handler specs are pre-existing/unrelated.

Pending: manual dev-server visual check (browser not connected). Deferred: post-submit AnswerReview.
