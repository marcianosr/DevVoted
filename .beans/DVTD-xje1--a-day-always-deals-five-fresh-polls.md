---
# DVTD-xje1
title: A day always deals five fresh polls
status: completed
type: bug
priority: normal
created_at: 2026-10-04T06:56:31Z
updated_at: 2026-10-04T07:02:39Z
---

**What:** Every day a run starts with five polls it has not answered before, even when the day's shared set holds a poll the run already answered.

**Why:** A repeat in the shared set was dropped without a replacement, so the day dealt four polls and ended early; a gap it left in the run's poll list then shifted the community panel by one.

## Done when

- [x] A day whose shared set repeats an answered poll still deals five
- [x] The replacement is the same for everyone who needs one that day
- [x] A gap in the run's poll list no longer shifts which polls the day or the community panel counts
- [x] Tests cover both

## Notes

Found 2026-10-04 on run 122: 10-03 seed 77,85,91,30,75 with 77 answered on 10-01 gave positions 10-13; positions 15-19 on 10-04 with 14 missing. rollSegmentForward treats polls_answered (an array index) as a position; fetchConsumedPollsForDay does the same.

## Summary of Changes

- The day deal tops a short seed up from that date's own shuffle of the poll pool, skipping polls the run answered; a long local seed is kept whole.
- The new-day roll, the rebase rewrite and the community poll list count the run's polls by list order, not stored position, so an old gap no longer shifts them.
- Domain tests for the deal; repository tests for a repeat, a leftover from yesterday, a gap and an already-dealt day; a community query test across a gap.
- Wiki section 2.1 states the no-repeat rule. No changelog entry: the daily segments have not shipped yet.
