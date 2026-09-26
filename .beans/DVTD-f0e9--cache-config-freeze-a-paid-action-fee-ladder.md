---
# DVTD-f0e9
title: 'Config: .cache freezes what a paid action costs'
status: draft
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-14T13:31:24Z
updated_at: 2026-09-24T12:49:11Z
parent: DVTD-72d9
---

**What:** A config that pins every paid action at its first price, so the fee ladder stops climbing.

**Why:** Fees are what stop a player spamming paid actions, so this is a big effect that needs a heavy price.

## Done when
- [ ] The price and the check it carries are decided and written down
- [ ] Every paid action stays at its first rung while it is installed
- [ ] What it does to the config that demands a paid peek is stated
- [ ] A spec covers a ladder that would otherwise have climbed

## Notes

From Marciano's 'halve Telemetry's price' idea, generalised so it needs no named partner. A fee ladder is a cache-miss cost curve, so .cache freezes it: every use costs the first rung (lint stays 8KB, peek stays 32KB). CAUTION: wiki 4.1 makes fees the mechanism that bounds actions, so freezing one is a partial repeal of a pricing rule, and it also drops Telemetry's mandatory peek demand to its floor, weakening another config's check. Wants a legendary price and a heavy check, not an uncommon. ESLint is in HANDED_CONFIGS so it always has a target.
