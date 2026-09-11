---
# DVTD-2wwl
title: Expose the day's seed on RunCommunityView
status: todo
type: task
created_at: 2026-09-11T11:12:07Z
updated_at: 2026-09-11T11:12:07Z
blocked_by:
    - DVTD-agt2
---

The kanto community header reads 'Seed #482 · five polls for Wednesday'. `RunCommunityView` carries `date` but not the seed — it lives in `dailyRunSeedsTable.seed`, keyed by date.

One field on `getRunCommunityService`, read through `getOrCreateDailyRunSeed` in `runPolls.repository.ts`. Needed when the kanto screen gets wired to the route.
