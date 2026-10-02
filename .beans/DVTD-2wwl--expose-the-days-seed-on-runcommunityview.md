---
# DVTD-2wwl
title: Expose the day's seed on RunCommunityView
status: scrapped
type: task
priority: normal
created_at: 2026-09-11T11:12:07Z
updated_at: 2026-10-01T15:39:19Z
blocked_by:
    - DVTD-agt2
---

The kanto community header reads 'Seed #482 · five polls for Wednesday'. `RunCommunityView` carries `date` but not the seed — it lives in `dailyRunSeedsTable.seed`, keyed by date.

One field on `getRunCommunityService`, read through `getOrCreateDailyRunSeed` in `runPolls.repository.ts`. Needed when the kanto screen gets wired to the route.

## Reasons for Scrapping

Closed in the 2026-10-01 stale-bean sweep: the premise is gone. The kanto community screen is wired, and its title is the gate name plus today's climb. Seed #482 survives only in a spec fixture.
