---
# DVTD-j7po
title: A poll can be skipped
status: completed
type: feature
created_at: 2026-10-01T19:13:39Z
updated_at: 2026-10-01T19:13:39Z
---

**What:** A player can pass on a poll: it covers nothing and is left out of the multiplier.

**Why:** With every poll forced, guessing is always right and no penalty can make "do I know this?" a choice.

## Done when

- [x] A skip press under Lock in spends the poll without answering it
- [x] A skipped poll covers nothing and leaves the multiplier as it was
- [x] A skip breaks the streak and forfeits the swatch
- [x] A skip writes no community answer and earns no unlock progress
- [x] A poll approved for LGTM cannot be skipped

## Notes

ADR-169. Reducer `skip` in answer.model; `AnswerOutcome` gained "skipped" (`GradedOutcome` is what grading returns and what the DB enum stores). The chain, Cache, Dependabot and nextStreak reset on a skip; objectiveProgress emits nothing for one and "cleared-after-two-misses" ignores it; accuracyViewFor drops skipped polls. The repository writes poll responses only on "answer", so a skip writes none. Wired in RunPoll.component and proto-run. The balance sim plays no skips yet.

## Summary of Changes

Built as listed, test-first (answer.model, autoUpgrade, objectiveProgress, gateStake, pollScreen and PollScreen specs).
