---
# DVTD-l5l7
title: Wiki states one scoring model
status: completed
type: task
priority: normal
created_at: 2026-10-05T13:54:54Z
updated_at: 2026-10-05T13:56:07Z
---

**What:** The wiki describes coverage, the codebase, the accuracy bonus and the swatch rule once, matching the per-gate model the game runs.

**Why:** An outside review found several scoring models side by side in the wiki, so a reader cannot tell which one the game plays.

## Done when
- [x] Every section and the glossary describe the meter as per gate, with a codebase of 5 to 10
- [x] The accuracy formula states what its share is measured over
- [x] The swatch is described as a full bar, not five right answers
- [x] No sentence claims a bare build cannot clear
- [x] The numbers reference lists the current gate rungs and accuracy constants

## Notes
Source of truth: coverageRatio.model.ts (GATE_RUNGS, ACCURACY_GAIN_PER_GATE, ACCURACY_LOSS_PER_GATE). ADR-181, ADR-170. Sell/drop still refuse the last config (rules.model atMinimumWidth); its ADR-035 rationale is stale.

## Summary of Changes

Wiki §2.2, §2.5, §2.8, §3, §9 and §10 rewritten to the per-gate model in coverageRatio.model.ts: codebase 5 to 10, share normalised over credit offered, swatch on PERFECT, no bare-build-never-clears claim. Added the accuracy constants to §10. Flagged: ADR-035's reason for refusing the last config no longer holds.
