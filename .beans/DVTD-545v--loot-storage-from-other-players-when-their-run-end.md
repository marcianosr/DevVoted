---
# DVTD-545v
title: Loot storage from a run that has ended
status: todo
type: feature
priority: normal
tags:
    - gameplay
    - juice
    - meta-progress
created_at: 2026-07-19T09:09:13Z
updated_at: 2026-09-24T12:49:07Z
parent: DVTD-z2r2
---

**What:** Let a player take storage off another player's finished run.

**Why:** Turns someone else's failure into something you can find.

## Done when
- [ ] Only finished runs can be looted, from a pool fixed at a day boundary
- [ ] Nothing a player already banked can be taken
- [ ] Who you can loot does not vary from player to player within a shared day
- [ ] A spec covers the pool and the transfer

## Notes

When another player's run ends, their abandoned items/loot should be storable by other players who encounter them. This creates emergent gameplay where players can benefit from others' progress and failures.


## Kept 2026-09-04

Reviewed against DVTD-in1b (will unbanked storage to a category pool) and kept
deliberately: they are different mechanics. in1b is a donation of ashes that
costs nothing and pays everyone. This is taking storage off a specific player,
which is the fun part and also the part that needs guard rails.

Constraints any shape has to satisfy:

- Nothing in a live run may read live social data. The pool of lootable runs has
  to be **completed** runs, fixed at a boundary, the same rule that makes ghosts
  legal.
- The loser must not be able to lose what they already banked. `archived_storage`
  is the permanent balance; the lootable amount can only be the run's unbanked
  remainder, or the loot has to be minted rather than transferred.
- The seed is shared daily, so who you can loot cannot be a per-player roll
  without breaking the shared climb.
