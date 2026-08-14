---
# DVTD-rcw9
title: 'Poll answering readability pass: numbered options, no truncation, clearer states'
status: completed
type: feature
priority: normal
created_at: 2026-07-18T08:31:02Z
updated_at: 2026-07-18T14:38:02Z
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

## Gate-failed restyle (same session, Marciano's mockup)

StripScreen reworked: merged intro line ("This gate was too hard — your build broke because:"), failed checks directly under, divider, action-first heading with the count ("Remove N configs to continue" / "Build repaired — climb on when you're ready"), muted "pick carefully" hint, and a pewter footnote naming fixed configs ("Unit Tests can't be removed — fixed for every run."). AnswerResults moved below the remove action. Removed the old three-line preamble.

## Gate failed/succeeded v2 (Marciano's mockup, same session)

- StripScreen: subtitle trimmed to "Your build broke because:"; remove section is now a cerulean CTA card ("Remove N configs to continue →" + "This is the only thing standing between you and gate {N}."), turning viridian when repaired. gateNumber prop threaded from both callers (gatesCleared + 1 — the failed gate is retried, NOT skipped; mockup said "gate 3" at HUD 2/5, implemented honestly as the attempted gate).
- New `presentation/run/ReviewAnswers.ui.tsx`: collapsed review bar ("📋 Review your N answers" + OutcomeCounts + "Review answers →") expanding into AnswerResults. Used on BOTH StripScreen and RewardScreen; OutcomeCounts exported from AnswerResults.

## Pipeline rows unified (Marciano's mockup, image 13)

- One row anatomy everywhere: state icon · ConfigChip · inline muted "fixed" tag · demand text · trailing progress. RoleList rebuilt on the exported `PipelineRowList` (role badge dropped; perks keep the ＋ icon).
- Row bg tints removed (`stateRow` deleted from checkStateStyles); the box carries a faint tone (`border-{c}/40 bg-{c}/5`), state color lives in icon + progress.
- "fixed" corner badge suppressed in rows via new `ConfigChip.noFixedBadge`; shop/loadout chips keep the corner badge.
- CheckList text now uses `gateRowDescription` (exported from configRole.model) — the DVTD-7wy6 escalation fix now covers the "build broke because" rows and the mobile Stakes panel too.
