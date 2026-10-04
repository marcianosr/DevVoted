---
# DVTD-zauk
title: Poll screen reads coverage in units
status: completed
type: feature
priority: normal
created_at: 2026-09-24T11:28:18Z
updated_at: 2026-09-24T11:46:22Z
---

The poll screen's coverage header leads with units held against the gate's HEALTHY units instead of a percent, so the cumulative re-base reads as the target rising (3 at Pallet, 6 at Boulder) rather than the number halving. Bar geometry stays percent; debrief, run over, prep and shop keep percent. Rejected: hiding the percent until Boulder (that is where the halving happens).

## Todos

- [x] CoverageBar.ui: optional units reading (header badge, aria, pin, status, HEALTHY mark)
- [x] pollBarFor passes units
- [x] Factory, story, specs
- [x] ADR-106
- [x] README index, wiki, CHANGELOG

## Summary of Changes

- `CoverageBar.ui`: optional `units: { held, healthy }` prop; `figuresOf` is the one seam for the header badge, aria reading, pin (settled and counting), status announce and HEALTHY mark. Geometry untouched. `CoverageReading` badges `held of needed` when units are given.
- `pollBarFor` passes `gateStake.unitsHeld` and `healthyUnitsAt(gateNumber)`. Only the poll screen passes units.
- Factory: `kantoCoverageUnitsOf(heldPercent)`; poll stories and PollScreen spec read `35 of 40`.
- Story `SpokenInUnits`; the stories' stale Pallet line (5%) corrected to 60%.
- Specs: six new bar tests, two new `pollBarFor` tests (the re-base thesis), one PollScreen expectation.
- ADR-106 (amends 070 and 077), ADR index, wiki §2.2 and §8, CHANGELOG Changed entry.
- Rejected: hiding the percent until Boulder.
