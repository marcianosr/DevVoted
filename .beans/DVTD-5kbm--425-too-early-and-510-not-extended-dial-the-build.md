---
# DVTD-5kbm
title: 425 Too Early and 510 Not Extended dial the build down
status: completed
type: feature
priority: normal
created_at: 2026-09-26T17:40:43Z
updated_at: 2026-09-26T17:53:14Z
parent: DVTD-9vhf
---

**What:** 425 takes the whole build off the window's opening poll; 510 runs every upgraded config at v1 for the attempt.

**Why:** Every audit so far switches one config fully off. These two are the first that take the whole build for a moment and the first that dials it back rather than out.

## Done when
- [x] The opening poll under 425 pays base credit with no config contribution, no faucet, no wager and no paid actions
- [x] Every chip reads offline and names 425 on that poll, and comes back on the next one
- [x] 510 flattens versions for scoring while the stored build keeps them
- [x] Neither lands beside an audit that already takes or reads a config
- [x] The wiki and the Dex state both

## Notes

425 disarms Cold Start's zero opener as well as Overclock's multiplier. That asymmetry is deliberate: builds are open, so firing 425 at a Cold Start build is a wasted shot.

## Summary of Changes

ADR-122. `OfflinePick` gained `whole-build-first-poll`, the first pick that returns more than one config and the first that can return none; 425 rides it through `offlinePairsFor`, so `liveConfigsOf` hands the opening poll an empty build and every chip already reads offline and names the audit without a line of presentation work. 510 added `resetsVersions`, folded by `auditsResetVersions` and applied as `atFirstVersion` over the build inside `liveConfigsOf`; `state.build.configs` keeps its versions, which a spec pins because `auditsOf` reads the upcoming gate and the shop sits before it. Both joined the `offline-config` family so neither lands beside 424, 409, 426, 502 or 503. Pools follow power: 425 in B and C, 510 in C only.

409 and 426 stopped saying "highest-level" and "lowest-level" in copy a player reads; the domain still says `level`, which stays open.
