---
# DVTD-f0e9
title: '.cache config: freeze a paid-action fee ladder'
status: draft
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-14T13:31:24Z
updated_at: 2026-09-06T09:57:03Z
parent: DVTD-72d9
---

From Marciano's 'halve Telemetry's price' idea, generalised so it needs no named partner. A fee ladder is a cache-miss cost curve, so .cache freezes it: every use costs the first rung (lint stays 8KB, peek stays 32KB). CAUTION: wiki 4.1 makes fees the mechanism that bounds actions, so freezing one is a partial repeal of a pricing rule, and it also drops Telemetry's mandatory peek demand to its floor, weakening another config's check. Wants a legendary price and a heavy check, not an uncommon. ESLint is in HANDED_CONFIGS so it always has a target.
