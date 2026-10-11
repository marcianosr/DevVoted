---
# DVTD-63qu
title: Prefetch reads tomorrow's deal once today's polls run out
status: completed
type: bug
priority: normal
created_at: 2026-10-11T17:00:59Z
updated_at: 2026-10-11T17:25:11Z
---

**What:** Prefetch names the polls of the next window even when they belong to tomorrow's deal.

**Why:** After clearing today's gate the prep screen showed Prefetch's panel empty, so the config paid for nothing at the moment it matters most.

## Done when
- [x] The prep screen after a cleared gate names tomorrow's five polls for a Prefetch holder
- [x] The poll shapes (answer type, option count) of tomorrow's polls show for the upgraded Prefetch
- [x] The next gate row names tomorrow's polls while today's gate is still open
- [x] What Prefetch shows matches what the player is dealt, including polls they already answered being swapped out

## Notes
Cause: the run view slices the run's own poll list past the current index, and a run only receives a day's polls on that day's first action (rollSegmentForward). The getUpcomingCategories server function that read tomorrow's seed was never called. Reading tomorrow's deal rolls tomorrow's seed early for Prefetch holders, so polls published later that day miss tomorrow.

## Summary of Changes

The run view now reads Prefetch over the run's dealt polls followed by the player's own deal for tomorrow (seed order, answered polls swapped from the reserve, the same rule the day roll uses). The service fetches that deal only for a live run with a prefetcher. The dead getUpcomingCategories server function, its service and fetchSeedCategoriesForDate are removed; getTomorrowDateString is replaced by dayAfter(date) so tomorrow follows the request's date.
