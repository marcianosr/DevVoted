---
# DVTD-zlkc
title: Free navigation after clearing pipeline gate
status: completed
type: feature
priority: high
created_at: 2026-06-01T13:21:44Z
updated_at: 2026-06-01T13:25:09Z
---

Currently after clearing a gate, the player is locked into the pipeline upgrade screen on /daily-poll. Change so:
1. Player can navigate freely after gate-clear; no forced picker on /daily-poll when hasAnswered=true.
2. Add 'Scores' link to nav (-> /progress) and a new 'Pipelines' link (-> new /pipelines route) hosting the upgrade picker.
3. Show '(new)' badge on Pipelines link while pendingUpgradeCards.length > 0.
4. If player skips picking and starts next day's poll without picking, force the picker before they can answer (pendingUpgradeCards > 0 && !hasAnswered).

## Todos
- [x] Create /pipelines route hosting PipelineUpgradeContainer + empty state
- [x] Add Scores and Pipelines links to root nav with (new) badge logic
- [x] Change DailyPollContainer force-render gate from `length>0` to `length>0 && !hasAnswered`
- [x] Add subtle hint in poll-results section pointing to /pipelines when upgrade pending
- [x] Verify build / typecheck / lint

## Summary of Changes

- Extracted `useApplyPipelineUpgrade` hook (`src/domains/runs/hooks/useApplyPipelineUpgrade.ts`) so the inline and standalone pickers share apply logic.
- Added `/pipelines` route (`src/routes/_authed/pipelines.tsx`) — renders `PipelineUpgradeContainer` when cards pending, otherwise shows current slots + empty state.
- Updated root nav: added `Scores` (→ /progress) and `Pipelines` (→ /pipelines) links; `(new)` green badge on Pipelines when `activeRun.pendingUpgradeCards.length > 0`.
- Changed `DailyPollContainer` force-render gate from `pendingUpgradeCards.length > 0` to `... && !hasAnswered`. After clearing a gate, the player sees normal poll results with a banner pointing at `/pipelines`. Next day, if they still have not picked, the picker blocks the unanswered poll.
- Added inline banner in poll-results when `hasAnswered && hasPendingUpgrade` linking to `/pipelines`.

All 354 tests pass; typecheck and oxlint clean.
