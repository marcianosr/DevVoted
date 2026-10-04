---
# DVTD-fixa
title: Code Coverage pays more per version
status: completed
type: feature
priority: normal
created_at: 2026-09-30T08:53:54Z
updated_at: 2026-09-30T09:20:36Z
parent: DVTD-72d9
---

**What:** Code Coverage's flat add scales with its version, +0.1 units a correct answer at v1 up to +0.5 at v5.

**Why:** The config was stuck at v1 with copy that still promised a percentage it no longer pays.

## Done when
- [x] The shop sells Code Coverage an upgrade, and each rung reads the units it adds
- [x] A correct answer pays +0.1 × version, flat, never amplified by a multiplier
- [x] The card and the Dex state the flat amount, and no text still says +10%

## Notes

Design settled 2026-09-29 (ADR-158). The base stays 0.1, so ADR-083 D5 still holds at v1. Closes DVTD-de7t.

## Summary of Changes

`coverageAddOf` in config.model scales the add by version (rounded to hundredths, halved when minified) and feeds the effect, the headline figure, the upgrade preview, and the derived description and gives. `isUpgradable` lists `coverageAdd`. Roster fallbacks and the Dex fixture drop the +10% copy. Story `PaysHalfAUnitAtV5`. ADR-158 D1; wiki §4.3, §4.4 and the numbers sheet updated.
