---
# DVTD-8j1l
title: The standing card states its gate, its band and its rescue
status: completed
type: task
priority: normal
created_at: 2026-09-29T09:32:42Z
updated_at: 2026-09-29T09:40:35Z
---

**What:** The climber card reflows: build chips run inline, the gate number sits under the gate name, the coverage band badge moves beside the bar, and a rescued run says so under the avatar.

**Why:** The card read as a stack of unrelated rows, and the track legend explained marks the player never sees.

## Done when

- [x] Build chips wrap inline instead of stacking one per row
- [x] The gate number reads below the gate name, not beside the band badge
- [x] The band badge sits right of the coverage bar
- [x] A rescued run states it under the avatar
- [x] The climb map legend drops its marks line
- [x] Seed casts more Kanto climbers and fills the turnout panel

## Summary of Changes

Standing: the gate name keeps its own row, the gate number reads under it, and the band badge moved beside the bar in a flex row (the bar needs a `min-w-0 flex-1` wrapper or its `w-full` pushes the badge off the edge). Build chips wrap inline.

ClimberCard: the face sits in a column that carries **Saved by git tag** under a rescued run. The climb map legend dropped its marks line, since the tag now explains itself.

Community service: the day turnout was thrown away whenever the viewer had not consumed a poll yet, so a fresh run read `0 players`. `EMPTY_VIEW` now takes the players it already fetched; poll detail stays sealed.

Seed: ten more Kanto climbers (Red, Bill, Prof. Oak, Daisy, Mr. Fuji, Nurse Joy, Officer Jenny, Jessie, James, Copycat), most of them low on the track so a fresh run has company. They carry no portrait and render initials, so `photoUrl` is optional now. Every climber run writes a `lastClose`, which is why nobody ever flickered or wore a perfect rim before: the mark reads `closingBand`, and the seed never set one.

Verified: 262 files / 4839 tests pass, tsc clean, oxlint + depcruise + docs:check clean. The seed itself is unrun (it resets the local database).
