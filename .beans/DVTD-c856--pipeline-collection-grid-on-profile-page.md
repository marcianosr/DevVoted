---
# DVTD-c856
title: Pipeline collection grid on profile page
status: completed
type: feature
priority: normal
created_at: 2026-05-06T20:00:28Z
updated_at: 2026-05-06T20:02:05Z
---

Show a 5x4 grid (5 gate types x 4 difficulties = 20 cells) on the profile page. Unlocked cells show the slot a player has ever had in any run; locked cells show a lock icon + ???. Public visibility.

## Summary of Changes

- Added `getAllRunsByUserId` query to `run.queries.ts`
- Added `getRunsByUserIdFn` server function to `runs.ts` (public, userId param)
- Created `src/domains/runs/utils/pipelineCollection.ts` — `getDiscoveredSlotKeys` pure util + constants
- Created `src/domains/runs/components/PipelineCollection.component.tsx` — 20-cell collection grid
- Updated profile route to fetch runs and render the collection grid
