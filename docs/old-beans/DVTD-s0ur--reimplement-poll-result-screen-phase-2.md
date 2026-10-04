---
# DVTD-s0ur
title: Reimplement poll result screen (Phase 2)
status: in-progress
type: feature
priority: normal
created_at: 2026-07-01T12:30:57Z
updated_at: 2026-07-01T12:54:39Z
---

Redesign post-submit step 0 into the lean ResultScreen from the DevVoted Flow design: VerdictHero (verdict + coverage delta + configs fired) + AnswerReview (per-option distribution bars). Community avatars/awards move to a future community screen. Keep fonts/colors per ADR-004.

## Summary of Changes

Phase 2 redesigns post-answer step 0 into the lean ResultScreen.

- New Tier-1 UI (src/ui/polls/): PollVerdictHero, PollAnswerReview, PollResultScreen (+ stories). Answers render as flat text lines (no per-option blocks) to match the answering screen, per user feedback.
- New pure helpers (src/domains/polls/utils/pollResult.ts): evaluateSelectionOutcome, buildAnswerReview, resolveFiredConfigs (+ spec, 8 cases).
- PostAnswerCarousel step 0 now composes PollResultScreen; removed community avatars/awards/GatesMinimap/ExposedConfigDeck/CategoryWeights (moving to a future community screen). Components kept for reuse.
- Kept: explanation callout, code examples. Verdict extends design's binary to full/partial/wrong for multi-answer support.
- tsc + lint + new tests green. Pre-existing handlers.spec failures unrelated. Manual visual check pending (browser not connected).

## Update: carousel removed + detailed score

- Removed the 3-step PostAnswerCarousel; PollResultsSection now composes PollResultScreen directly. Pipeline & Shop steps drop out (become their own future screens/phases). Deleted PostAnswerCarousel.component.tsx and the now-orphaned ScoreBlock.component.tsx.
- Cleaned dead wiring from DailyPollContainer (offeredConfigs/nextOfferedConfigs props, exposedConfigDeck query + getExposedConfigDeck import, today/date).
- Added detailed score: new buildScoreSummary util (+ tests) + PollScoreSummary.ui.tsx (base coverage, per-config & streak bonuses, earned this poll, category coverage prev→now, current/best streak, polls answered). Rendered under the verdict.
- tsc + lint + 34 poll tests green.
