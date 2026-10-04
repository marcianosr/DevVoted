---
# DVTD-tb6m
title: The player sees coverage, never the codebase
status: completed
type: feature
priority: normal
created_at: 2026-10-02T08:49:58Z
updated_at: 2026-10-02T08:59:37Z
---

**What:** Every screen states coverage in percent and gains in points, and none states the gate's change count.

**Why:** The 9 to 11 changes is a balance divisor, not something the player covers, and the live floor made the covered count fractional (1.08 of 9).

## Done when
- [x] The poll lead, At stake, prep Scoring, gate result, run-over and Dex read percent and points only
- [x] The clear objective states the band and its line together
- [x] The box per change is gone from At stake and the gate result
- [x] Every touched viewmodel has a guard that no line says change
- [x] The ADR trail, wiki and changelog say why

## Notes
- ADR-171 supersedes ADR-139's player-facing codebase count and ADR-170 (swatch) D3-D4; ADR-170 D1-D2 (full bar earns the swatch) stand.
- Brief replaces the changes block (BandBrief), Scoring drops the slots column, GateStake.unitsHeld and changesCoveredAt are deleted.
- Rejected: boxes without a number (still state the divisor); "Build coverage to OK or better" as the brief (repeats the objective).
- Settles the changes vs codebase-slots wording conflict in DVTD-e6gg.

## Summary of Changes
Copy rewritten on the poll lead, At stake (brief, objectives, standing line), prep Scoring, gate result, run-over and Dex; box track and Scoring's changes column removed; unitsHeld and changesCoveredAt deleted; no-change-word guards in every touched viewmodel and three rendered screens. ADR-171, wiki, CHANGELOG.
