---
# DVTD-0m1s
title: The community polls panel spotlights the hardest and easiest poll
status: completed
type: feature
priority: normal
created_at: 2026-10-15T11:38:07Z
updated_at: 2026-10-15T11:45:44Z
---

**What:** The community screen's poll panel shows only the day's hardest and easiest poll and a small primary button to review every answer.

**Why:** Five expandable rows repeated the review screen; two cards tease the day and send you to the full review.

## Done when

- [x] The panel shows the hardest and the easiest revealed poll with how many got it and who
- [x] The review button is a small primary button
- [x] Before any poll is revealed the panel states the hint
- [x] Wiki and changelog describe the new panel

## Notes

Plan: ~/.claude-work/plans/i-don-t-understand-i-partitioned-codd.md. Faces come from a single poll's right option only; your face leads when you got it. No 'you too' line (Marciano's call). PollResult is removed.

## Summary of Changes

New PollSpotlight.ui (hardest and easiest card, faces of who got it on single polls with yours first, small primary review button, hint before any reveal). pollSpotlightFor replaces pollResultsFor and pollTallyFor; proto-run feeds it simulated community polls. PollResult.ui and its spec and story are deleted. New flame and target icons replace the emoji. The average header was dropped at Marciano's call. Wiki 7.1 and CHANGELOG updated.
