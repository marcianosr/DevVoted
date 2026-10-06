---
# DVTD-dw3p
title: A run that ends on a later day than it started vanishes from the hub
status: in-progress
type: bug
priority: critical
created_at: 2026-10-06T08:40:14Z
updated_at: 2026-10-06T08:43:28Z
---

**What:** When a run falls or wins on a later day than it started, the hub shows no run and the community board shows nobody.

**Why:** Most runs span several days, so most players never see their game-over screen or today's board after their run ends.

## Done when
- [ ] A run that ended today shows its over screen on the hub, whatever day it started
- [ ] The community board counts today's players for a player whose run ended today
- [x] The changelog states the fix

## Notes
Today's run was looked up by seed_date, which is only written when the run is created. A finished run is now also found by finished_at falling inside today. Found while chasing DVTD-25es: the owner's run died at gate 2 on 2026-10-06 after starting on an earlier day.
