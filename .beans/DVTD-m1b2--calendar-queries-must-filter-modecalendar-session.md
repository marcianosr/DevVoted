---
# DVTD-m1b2
title: calendar queries must filter mode='calendar' (session rows leak in)
status: completed
type: bug
priority: normal
created_at: 2026-07-18T07:56:11Z
updated_at: 2026-07-18T07:58:37Z
---

Slice 2 (DVTD-qmc5) made session runs write polls_responses rows into the shared table. Date-scoped calendar-loop queries filter only poll_id/user_id/created_at, so a session answer to the same poll on the same day leaks into: getCommunityStatsForDailyPoll (2 queries), hasUserRespondedToPollToday-style check, getUserSelectedOptions. Fix: add mode='calendar' to all four. run_id-scoped queries verified safe.

## Summary of Changes

Added mode='calendar' filters to the four date-scoped readers: getCommunityStatsForDailyPoll (both the breakdown select and the random-voter pick in communityStats.queries.ts), hasUserAnsweredPoll, getUserSelectedOptions (pollResponse.queries.ts). run_id-scoped queries (window.queries, run.queries loot count, response-by-run lookups) verified safe — calendar run ids never collide with session run ids. 765 tests, lint+arch, build green.
