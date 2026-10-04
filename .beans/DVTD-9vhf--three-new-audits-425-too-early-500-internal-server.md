---
# DVTD-9vhf
title: 'Three new audits: 425 Too Early, 500 Internal Server Error, 510 Not Extended'
status: completed
type: epic
priority: normal
created_at: 2026-09-26T17:40:18Z
updated_at: 2026-09-26T17:53:28Z
---

**What:** Three audits join the roster: 425 sits your build out of the window's opening poll, 500 darkens the coverage meter until the fifth answer, 510 runs every upgraded config at v1.

**Why:** The roster has no audit that keys off where you are in the window on the build side, none that withholds the player's own numbers, and none that dials a build down instead of switching a config off.

## Done when
- [x] 425 takes the whole build off the opening poll and base credit still scores
- [x] 500 darkens the meter, its band and the units row for the window's first four answers
- [x] 510 runs every upgraded config at v1 for the attempt without touching the stored build
- [x] Each of the three is drawn from the pools its power earns
- [x] The wiki states all three and the Dex lists them

## Notes

Placement follows power: 500 takes nothing and goes everywhere, 425 costs about a fifth of a window's config value and waits for pool B, 510 has the highest ceiling and sits in pool C beside 403 and 410.

## Summary of Changes

The roster went from 17 audits to 20. ADR-122 covers 425 and 510, ADR-123 covers 500. The wiki states all three, `AUDIT_POOLS` regenerated, and the 4xx/5xx signal widened from "your build is down" to "something on your side broke", which 500 is the first audit to need.

Verified: 4078 tests pass (4062 before), tsc clean, `npm run lint` clean bar two pre-existing warnings, `docs:check` in sync.
