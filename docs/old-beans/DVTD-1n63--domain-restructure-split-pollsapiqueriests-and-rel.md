---
# DVTD-1n63
title: 'Domain restructure: split polls/api/queries.ts and relocate run-scoped modules'
status: completed
type: task
priority: normal
created_at: 2026-05-04T14:57:17Z
updated_at: 2026-05-04T19:48:17Z
---

Split the 1022-line god-object queries.ts into focused modules and relocate run-scoped logic to runs/. Per ADR-003 and CONTEXT.md decisions.

- [ ] Create polls/api/poll.queries.ts (CRUD + fetch)
- [ ] Create polls/api/dailyPoll.queries.ts (daily selection)
- [ ] Create polls/api/communityStats.queries.ts (community stats)
- [ ] Create polls/daily/ folder and move communityStats there
- [ ] Move run-scoped functions to runs/api/queries.ts
- [ ] Move and rename processPollAnswer.service.ts → runs/services/turn.service.ts
- [ ] Update all importers
- [ ] Delete polls/api/queries.ts
- [ ] Run lint + typecheck

## Summary of Changes

Split polls/api/queries.ts (1022 lines) into focused modules and relocated all run-scoped logic:

**New files:**
- src/domains/polls/api/poll.queries.ts — poll CRUD + fetch
- src/domains/polls/daily/dailyPoll.queries.ts — daily poll selection
- src/domains/polls/daily/communityStats.queries.ts — community stats + types
- src/domains/runs/services/turn.service.ts — renamed from processPollAnswer.service.ts
- src/domains/runs/services/turn.service.spec.ts — moved + updated spec

**Moved to runs/api/queries.ts:**
createPollResponse, hasUserAnsweredPoll, getUserSelectedOptions, trackPollView, trackPollAnswer, getPollHistory, getPollsSeenInRun, getAnsweredPollsCountInRun, getWindowResults, getRunPollHistory, WindowResult, RunPollHistory types

**Deleted:**
- src/domains/polls/api/queries.ts
- src/domains/polls/api/queries.spec.ts
- src/domains/polls/services/processPollAnswer.service.ts
- src/domains/polls/services/processPollAnswer.service.spec.ts

All 27 test files pass (347 tests), build clean.
