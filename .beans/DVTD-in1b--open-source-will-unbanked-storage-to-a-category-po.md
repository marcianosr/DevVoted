---
# DVTD-in1b
title: 'Open Source: will your leftover storage to a category pool'
status: todo
type: feature
priority: normal
created_at: 2026-08-20T10:00:17Z
updated_at: 2026-09-24T12:49:30Z
parent: DVTD-u35m
---

**What:** At the end of a run, let the player will the storage that would evaporate into a category pool; the best-funded category pays everyone more the next day.

**Why:** A donation that costs nothing at the moment it is offered, and puts the donor's name somewhere.

## Done when
- [ ] The run-end screen offers it, showing the amount that would otherwise evaporate
- [ ] The pool is worked out from finished runs and fixed at the day boundary
- [ ] The next day's boost is the same for everyone, donor or not
- [ ] Donors are named somewhere
- [ ] A spec covers the pool and the flat payout

## Notes

Community "greater good" mechanic (brainstorm 2026-08-19). A run-end screen
action, NOT a rail config.

When a run ends (death or finish), only part of held storage banks — the rest
evaporates. Offer: "340KB unbanked — will it to a category pool?" At the day
boundary the most-funded category pays +25% coverage for ALL players the next
day, and sponsors get named (dev card / awards territory).

Why this shape survives the free-rider objection (Marciano: "why donate? your
competitors are also awarded"): the donation costs nothing at the moment it is
offered — the storage was evaporating anyway. You direct ashes, not power.
Recognition + riding tomorrow's boost yourself is the return.

Constraints:
- Pool is computed from COMPLETED runs and fixed at midnight — nothing in a live
  run depends on live social data (same rule that makes ghosts legal).
- Day-boundary timing must respect the DVTD-1z09 client/server midnight question.
- Payout is flat for everyone (no bigger cut for donors) — differential power
  would make it pay-to-win on the daily leaderboard.
