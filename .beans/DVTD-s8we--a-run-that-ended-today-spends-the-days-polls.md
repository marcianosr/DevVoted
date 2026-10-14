---
# DVTD-s8we
title: A run that ended today spends the day's polls
status: completed
type: bug
priority: critical
created_at: 2026-10-14T14:53:15Z
updated_at: 2026-10-14T14:58:58Z
---

**What:** After a run dies or is abandoned, a new run can be built and customised but its polls only open with tomorrow's batch.

**Why:** A dead player could start again and answer the seed polls the first run left over, often the same polls its first gate already showed.

## Done when
- [x] A run started after a run ended today is dealt no polls today
- [x] That run is dealt tomorrow's polls when the day turns
- [x] The game over screen and the hub let the player start and customise, and prep refuses to start the gate
- [x] The decision record and the wiki state the new rule
- [x] The changelog names the fix

## Notes
openTodaysRun dealt today's seed minus the polls answered today. Replaces the stub segment accepted in ADR-014.

## Summary of Changes

A new run is dealt no polls once the player answered any poll today (the day-spent rule is per player, not per poll), so abandoning a fresh run before answering still deals the full five. startRunService always creates the run; an empty one has no run_polls rows, and rollSegmentForward falls back to the run's seed date so tomorrow deals its first five at position 0. The hub and game over screen offer Start on a spent day with no live run; prep refuses with polls spent. ADR-014's accepted cost, the wiki and the changelog are updated.
