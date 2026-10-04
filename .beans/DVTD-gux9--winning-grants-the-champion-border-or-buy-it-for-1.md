---
# DVTD-gux9
title: Winning grants the Champion border, or buy it for 10 TB
status: completed
type: feature
priority: normal
created_at: 2026-10-04T11:23:29Z
updated_at: 2026-10-04T11:34:32Z
parent: DVTD-kulw
blocking:
    - DVTD-g1p0
---

**What:** A Champion border that a win grants, also on sale for an absurd 10 TB.

**Why:** A champion should be recognisable by their face anywhere in the game.

## Done when
- [x] Winning a run from the first gate puts the Champion border in your collection
- [x] Winning again does not add it twice
- [x] The shop states both paths: win a run, or pay 10 TB

## Notes
ADR-184 D1 and D3. The grant rides the transaction that finishes the run. Part of DVTD-g1p0.

## Summary of Changes

TB storage unit, the Champion border in the catalog at 10 TB marked as earned by victory, an idempotent grant in the transaction that finishes a qualifying run, and a win a run, or line on the border card until owned.
