---
# DVTD-smye
title: Awards on run community page (like top committers)
status: completed
type: feature
priority: high
created_at: 2026-07-19T07:44:48Z
updated_at: 2026-08-04T19:45:18Z
parent: DVTD-h175
---

Add awards to the run community page, in the spirit of the existing top-committers awards: e.g. fastest climber, most storage banked, best streak of the day.

## Standouts v1 + timing capture (2026-08-04, in progress)

Marciano's mock: 'standouts today' rows (chip · name · award title · saffron value). Decisions via AskUserQuestion: build now with data-backed awards AND add answer-timing capture; clock = poll reveal → submit, client-measured elapsedMs in the answer action payload, server-validated.

- [x] Schema: polls_responses.answer_time_ms (nullable int) + guarded migration + db:push
- [x] Engine: answer action carries optional elapsedMs; AnsweredPoll stores it
- [x] Validation: zod clamp on elapsedMs; recordSessionAnswer persists it
- [x] Client: RunAnswer measures poll-shown → submit
- [x] Handler: standouts[] on RunCommunityView (first to answer, most <category> polls, fastest answer when timing exists)
- [x] UI: standouts panel on the community board (+ proto sim + seed timing so dev data lights it up)
- [x] Specs updated; lint + tsc + tests green

## Summary of Changes

- Timing capture: answer action gains optional elapsedMs (zod: int 0..600000); RunAnswer measures poll-shown → submit via a ref reset on poll id; engine stores it on AnsweredPoll; recordSessionAnswer persists to new nullable polls_responses.answer_time_ms (guarded migration 20260804190000, db:push applied locally).
- Standouts: RunCommunityView.standouts — fastestAnswerStandout (skips when no row is timed), firstToAnswerStandout (vs daily_run_seeds.created_at), mostCategoryStandout (needs count ≥ 2; deterministic tiebreak). fmtDuration → 9s / 1m45. Values pre-formatted server-side so Tier 1 stays dumb.
- fetchSessionAnswersForDay widened (categoryCode via polls join, created_at, answer_time_ms); new fetchDailySeedCreatedAt.
- UI: StandoutsPanel rows (AvatarDot extracted from VoterChip, name visible — viewer reads you in cerulean, value saffron). Proto-run sim fakes standouts (most-category counted from the gate's real mix). Seed writes deterministic 4s–2m timings; seed gained --refresh to redo a day in place.
- Knock-ons: RunAnswer spec action shape (+elapsedMs expect.any(Number)); legacy pollResponses.model fromDTO (+answer_time_ms: null); RunLayout spec fixture (+standouts).
- Verified: 1030 tests / oxlint + depcruise + tsc green; board screenshot matches the mock; seed rerun with timings.

Remaining brainstormed awards (fastest climber, most storage banked, best streak) stay in wiki §7.5 — follow-up beans on request.

Follow-up (same day, Marciano asked about Temporal + sharing fmtDuration): Temporal declined — still Stage 3, Firefox-only natively, would need a polyfill dep for one subtraction + a 4-line formatter (CLAUDE.md: built-ins over deps); Intl.DurationFormat IS shipped everywhere but its closest output is "1m 45s", not the mock exact "1m45". fmtDuration extracted to src/lib/dateUtils.ts as formatDurationMs (+ dateUtils.spec.ts, 4 tests) — now shared by community.handlers standouts AND the proto-run sim (which had hand-rolled duplicate strings). Client measurement upgraded Date.now() → performance.now() (monotonic; NTP/manual clock changes cannot skew a duration) with Math.round for the zod int.
