---
# DVTD-zfuv
title: Awaiting-tomorrow leaves a blank answer screen — redirect to community
status: completed
type: bug
priority: normal
created_at: 2026-08-04T20:34:17Z
updated_at: 2026-08-04T20:43:33Z
---

Day's segment exhausted (isAwaitingTomorrow): status stays 'answering', view.poll is null, RunAnswer renders null → blank page under the HUD at /run/answer. The lock has no destination since the LockedScreen removal (DVTD-053t). Decision (Marciano, 2026-08-04): the destination is the community board — syncTarget should send any run screen to /run/community while the run awaits tomorrow's segment.

## Todo

- [x] Expose awaitingTomorrow on RunView (derived via isAwaitingTomorrow)
- [x] syncTarget: locked run on any run screen → /run/community
- [x] Tests: viewmodel derivation + sync verdicts (+ routed RunLayout case)
- [x] Verify: vitest, lint, tsc

## Summary of Changes

- RunView gains `awaitingTomorrow` (derived from `isAwaitingTomorrow`, ADR-014); factory default added.
- `syncTarget` override: while the run awaits tomorrow, every run screen targets `COMMUNITY_ROUTE` (/run/community — exported constant, deliberately outside RUN_SCREEN_PATHS so the board itself is never policed).
- Tests: 2 viewmodel derivation cases, 4 sync verdict cases, 1 routed RunLayout case (memory-history router, real navigation).
- Boy scout (flagged): AnswerResults.spec expected the old "multi" marker; UI copy changed to "multiple choice" in commit ed4f057 — spec was red on HEAD, updated to match. Community board still uses "multi" (untouched).
- CHANGELOG "One gate a day" entry extended (day-end lands on community board); wiki §2.1 + §7.2 note the lock landing spot.

Verified: vitest 1045 passed / 109 files, oxlint + depcruise clean, tsc clean.

Next-day resume path confirmed: "Climb on →" navigates to /run; with a fresh segment the sync pulls to /run/answer. While still locked it bounces back to the board (benign; relabel is a possible follow-up).
