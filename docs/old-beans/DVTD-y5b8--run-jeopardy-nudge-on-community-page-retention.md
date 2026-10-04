---
# DVTD-y5b8
title: Run jeopardy nudge on community page (retention)
status: completed
type: feature
priority: normal
created_at: 2026-07-03T14:10:44Z
updated_at: 2026-07-03T14:15:33Z
---

Surface forward-looking run stakes on /community to nudge next-day return (loss aversion): 'You are N polls from Gate X, all checks must pass' + 'Your Y-times CATEGORY streak is live'. Reuses window context (gate, pollsUntilGate) and run categoryCoverage (currentStreak). New RunJeopardy.ui (Tier-1) + RunJeopardy.component (domain mapping); rendered on the community route.

## Summary of Changes

Added a forward-looking run-jeopardy nudge on /community to drive next-day return (loss aversion), reframing existing run state toward tomorrow.

- RunJeopardy.ui (Tier-1, +story): themed "Your run continues tomorrow" block. Gate line adapts on proximity ("One more answer reaches Gate N — all checks must pass." vs "You are N polls from Gate N..."). Optional streak line for the strongest live category streak.
- RunJeopardy.component (domain): maps windowContext (currentGate, pollsInWindow-pollsAnswered) + pipelineSlots.length + strongest categoryCoverage.currentStreak (>=2, named via CATEGORY_METADATA). Renders nothing when no window context / no slots.
- community route: loader also calls getWindowContextFn() and returns categoryCoverage + pipelineSlots; renders <RunJeopardy> below CategoryWeightsDisplay.

No new infra/external deps. tsc/lint/build clean, 532 tests pass.
