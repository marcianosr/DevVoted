---
# DVTD-rcw9
title: 'Poll answering readability pass: numbered options, no truncation, clearer states'
status: completed
type: feature
priority: normal
created_at: 2026-07-18T08:31:02Z
updated_at: 2026-07-18T08:42:29Z
---

Readability polish across the run answering flow, from mockups.

## Summary of Changes

- **PollCard** (`src/modules/run/presentation/poll/PollCard.ui.tsx`): replaced checkbox squares with zero-padded numbered rows (01, 02, …) separated by hairline dividers; regular-weight labels. Selected rows get a category-colored accent bar (`border-l-2 border-theme`) + `bg-theme-soft` + theme-colored number; hover shows a white accent-bar preview + `bg-white/10`. On reveal, the number swaps for ✓/✕ in viridian/cinnabar (mark kept for colorblind clarity).
- **Single vs multiple choice**: surfaced `answerType` (existed in run.model, never reached the UI) through AnsweringScreen → PollCard; hint line under the question: "Pick one answer" / "Multiple answers — select all that apply". Threaded through RunGame, proto-run, stories, specs.
- **AnswerResults** (`.../run/AnswerResults.ui.tsx`): removed both `truncate`s — question and picked answers now wrap fully (`items-start` rows); outcome tints bumped /10 → /20.
- New specs: numbered index rendering, ✓/✕ swap on reveal, answer-type hint.

## Follow-up in same session

- **Mobile HUD**: RunHud collapses below `sm` to `{KB} · Gate n/v · a/p polls` + a cinnabar "Stakes ▾" dropdown (SummaryDropdown gained `triggerClassName`) revealing the gate checks (CheckList) plus streak/coverage/loadout chips. Marciano picked "gate requirements + HUD extras" for the panel. `checks` threaded into RunHud (RunGame, proto-run, stories, specs).
- **AnswerResults → community tiles**: extracted `OutcomeTile` / `outcomeText` / `OUTCOME_ICON` into `presentation/poll/OutcomeTile.ui.tsx`; RunCommunity refactored onto it; AnswerResults rebuilt as tile grid (Poll N / icon / category) with expandable question+picks card. Specs rewritten for the expand interaction; RewardScreen spec updated.
