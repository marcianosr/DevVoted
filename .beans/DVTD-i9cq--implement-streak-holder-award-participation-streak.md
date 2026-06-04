---
# DVTD-i9cq
title: Implement Streak Holder award (participation streak)
status: completed
type: task
priority: normal
created_at: 2026-06-04T14:58:22Z
updated_at: 2026-06-04T15:08:24Z
---

Build the consecutive-day streak award per DVTD-vh73. Tie-break: show all tied players.

## Summary of Changes

Implemented run-scoped participation streak (not user-scoped — based on user feedback that streaks shouldn't apply to players without an active run).

### Schema
- 3 new columns on `runs`: `current_streak`, `longest_streak`, `last_streak_increment_date`
- Migration: `drizzle/0057_strange_lyja.sql` (applied to local dev)
- Run model + mock updated to include new fields

### Streak math
- New `streakMaintenance.service.ts` with pure `computeNextStreak` function
- 9 unit tests covering: fresh streak, continuation, missed-day reset, idempotent same-day, month/year boundaries
- UTC-normalised — streaks are global daily concept

### Maintenance hook
- Wired into `createPollResponse` transaction in `pollResponse.queries.ts`
- Operates on the run row (the runId passed to createPollResponse), not the user
- Idempotent — same-day re-answer doesn't double-increment

### Query layer
- Extended `CommunityStatsUser` with `currentStreak` (from user's active run; 0 if no active run)
- New `StreakHolders` type + `streakHolders` field on `CommunityStats`
- Tie handling: all players tied at max streak are returned in `players` array
- Streak holders excluded when nobody has a streak > 0

### UI
- New tile in `PostAnswerCarousel` social-proof row alongside First/Fastest/First good
- Singular 'Streak holder' / plural 'Streak holders' based on count
- Stacked avatars with -space-x-3 overlap, names joined with comma + '+N more' suffix
- Shows up to 3 avatars

### Verified
- tsc clean, lint 0/0, 9/9 streak tests pass
