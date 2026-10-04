---
# DVTD-035k
title: Remove season management (code-only)
status: completed
type: task
priority: normal
created_at: 2026-07-05T13:09:23Z
updated_at: 2026-07-05T13:13:26Z
---

Season feature unused. Remove ranking-domain season code + admin Season Management UI. Keep DB schema dormant (no migration). Keep runs-domain leaderboard which reuses season_id column.

- [x] run.queries.ts: seasonId = 1 -> null
- [x] Deleted ranking season files + removed empty ranking/ dir
- [x] admin.tsx: removed Season Management + now-unused router/PrimaryButton/isLoading/showCreateForm
- [x] queries.spec.ts: removed seasonService mock
- [x] Removed empty ranking/ dir + .gitkeep files
- [x] typecheck 0 errors, 509 tests pass

## Summary of Changes

Removed season *management* (code-only, no migration). DB schema kept dormant: seasonsTable, season_status enum, and season_id columns on runs + leaderboard remain (nullable). Runs-domain leaderboard (ranking.queries.ts, runCompletion.service.ts) untouched — it reuses season_id independently. New runs now insert season_id: null.
