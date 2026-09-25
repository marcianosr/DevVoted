---
# DVTD-i2jz
title: Show a config's version and what the next one buys, in the Dex
status: todo
type: feature
priority: normal
tags:
    - meta-progress
created_at: 2026-07-24T12:45:58Z
updated_at: 2026-09-24T12:49:07Z
parent: DVTD-z2r2
blocked_by:
    - DVTD-fv8x
---

**What:** Show each config's version in the Dex, with what the next version buys and what it costs.

**Why:** Nothing tells a player what an upgrade is for before they pay for it.

⚠️ Blocked: if versions do not survive a run there is nothing account-level to show here. That decision comes first.

## Done when
- [ ] Each config shows its version, and a maxed one looks different
- [ ] The detail view compares this version with the next, and names the price
- [ ] The list can be filtered and sorted
- [ ] It states how many are maxed

## Notes

Config dex shows each config's upgrade level and what the next level buys.

- Level indicator per config card, maxed state visually distinct
- Detail view: current vs next level effect, and the cost to get there
- Filter and sort by level, rarity, power
- Collection stats ("5 / 20 maxed")

Blocked on DVTD-fv8x: if config levels do not persist across runs, there is nothing account-level to show here. Note max level is 5 in-run (DVTD-z94q), not 10.
