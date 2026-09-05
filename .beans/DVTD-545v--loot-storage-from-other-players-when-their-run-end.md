---
# DVTD-545v
title: Loot storage from other players when their run ends
status: todo
type: feature
priority: normal
tags:
    - gameplay
    - juice
    - meta-progress
created_at: 2026-07-19T09:09:13Z
updated_at: 2026-09-04T18:44:37Z
parent: DVTD-z2r2
---

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
