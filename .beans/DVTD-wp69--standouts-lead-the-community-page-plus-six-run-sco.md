---
# DVTD-wp69
title: Standouts lead the community page, plus six run-scoped awards
status: completed
type: feature
priority: normal
created_at: 2026-08-07T12:33:27Z
updated_at: 2026-08-07T12:52:50Z
parent: DVTD-h175
---

Move the standouts panel to the top of /run/community and grow it from 3 awards to 9.

New poll-scoped: first good (earliest fully-correct answer), only one right (a poll exactly one player got right, restricted to polls the viewer has consumed).

New run-scoped, computed across ACTIVE session runs only: deepest gate, longest streak, most coverage, widest pipeline.

Decisions: longest streak = best this run, recomputed from state.allAnswered outcomes (no schema change); only-one-right honours the redaction rule; the 'also up for grabs' teaser is out of scope.

- [x] standouts.model.ts with the nine builders + longestCorrectStreak
- [x] fetchActiveRunStats in climb.queries.ts
- [x] handler: build standouts before the consumed-empty early return
- [x] Voter.ui.tsx extraction, Standouts.ui.tsx panel
- [x] reorder RunCommunity.component.tsx
- [x] seedCommunity + proto-run fixtures
- [x] deterministic tie-breaks on the two existing reduce-based awards
- [x] wiki 7.2/7.5 + CHANGELOG

## Summary of Changes

The standouts panel now leads /run/community and carries nine awards.

**New** `src/modules/run/community/standouts.model.ts` — all nine builders, pure. Correctness arrives as a `CorrectnessCheck` callback and run state as plain numbers, so no award needs a database to test. Owns `CommunityVoter` / `CommunityStandout` / `CommunityAnswer`; the handler re-exports them so no consumer moved.

**New run-scoped awards** (active session runs only): deepest gate (carries the gate swatch), longest streak, most coverage, widest pipeline. Fed by `fetchActiveRunStats` in `climb.queries.ts`, which unnests `state.allAnswered` in SQL to lift only the outcome strings — an AnsweredPoll carries the poll's correct option ids, and there is no reason to pull correctness data into Node to count a streak.

**New poll-scoped awards**: first good (first fully-correct answer) and only one right (the poll exactly one player cracked, restricted to polls the viewer has consumed so nothing ahead is spoiled).

**Fixed while here**: fastestAnswer and firstToAnswer used reduce with strict < over an unordered query, so ties went to whichever row Postgres returned first. Every award now goes through one `topBy` that breaks ties on player id.

**Presentation**: `Voter.ui.tsx` extracted (shared by option rows and standout rows), `Standouts.ui.tsx` added, `RunCommunityBoard` lost its standouts section, page order is standouts → climb → polls. Two columns via `sm:columns-2`, which fills top-to-bottom so the emit order becomes the split.

**Fixtures**: seeded trainers gained coverage, configs and an answer history (the outcome hash needed an index * prime, or every correct answer landed in one block and invented a 25-long streak at 60% accuracy). proto-run fakes all nine, including the swatch and the same >=2 category floor.

Verified: 1251 tests pass (119 files), tsc clean, oxlint clean, dependency-cruiser clean, production build passes. fetchActiveRunStats run against the real database. Panel checked in Storybook and on /proto-run.

Out of scope: the "also up for grabs" teaser (perfect gate, no linter used, biggest bank, comeback clear) — wiki 7.5 lists them.
