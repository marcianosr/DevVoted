---
# DVTD-yqy4
title: Design reward system for player storage
status: todo
type: feature
priority: normal
tags:
    - meta-progress
created_at: 2026-07-25T08:20:01Z
updated_at: 2026-09-04T18:44:11Z
parent: DVTD-z2r2
---

Define how players are rewarded with persistent storage, **for the players who
already exist on the live app**, not only for a clean 2.0 account.

## Why that framing matters

Live accounts already carry meta state: `users.archived_storage` (bytes,
credited at run end from unused in-run storage), `owned_border_ids`,
`owned_swatch_ids`, plus streak and coverage history in `leaderboard`. So the
question is not "invent a currency", it is "say what the existing balance is
for, and what happens to it".

## Open

- What does an existing balance buy? Today the archive is spent on start slots
  (ADR-049) and the git tag (ADR-036). Nothing else reads it.
- Does the existing balance carry into 2.0 at face value, scaled, or reset?
  **This contradicts a decision already on the books**: ADR-051 line 137 says
  "no grandfathering and no historical backfill: the game is pre-release, nobody
  has anything yet". If there are live players with balances, either that line is
  wrong for storage, or storage is deliberately the one thing that carries. Pick,
  and write it down.
- Is the reward loop legible in the live app today, or only after 2.0 ships? A
  balance the player cannot see accruing is not a reward.

## Related, not duplicates

- DVTD-54gi decides the *rate* at which leftover storage banks. This bean decides
  what banking is *for*.
- DVTD-in1b spends the unbanked remainder on a community pool.
