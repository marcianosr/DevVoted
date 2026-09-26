---
# DVTD-t8pg
title: 500 Internal Server Error darkens the coverage meter
status: completed
type: feature
priority: normal
created_at: 2026-09-26T17:40:43Z
updated_at: 2026-09-26T17:53:28Z
parent: DVTD-9vhf
---

**What:** The coverage meter, the band it reads and the units row go dark for the window's first four answers. Scoring is unchanged.

**Why:** No audit yet withholds the player's own numbers. Answering without knowing where you stand is a cost that takes nothing away.

## Done when
- [x] The reading is gone for four answers and back for the fifth
- [x] The panel keeps its place and its width, so nothing reflows mid-answer
- [x] Neither the spoken reading nor the live announcement leaks the figure
- [x] The receipt still states what each answer earned
- [x] The wiki and the Dex state it

## Notes

The band badge beside the reading is what a player reads as where they will land, so it is what goes dark. Nothing renders a projection today.

## Summary of Changes

ADR-123. `blindPolls` on the audit, folded by `auditsHideMeter(audits, answeredBefore)` in the shape `auditTimeLimitMs` already used, surfaces as `RunView.meterHidden`. `PollCoverage` became `Redactable<PollReadout>`, so the panel keeps its place, its 24rem width, its heading and its "what a poll pays" tooltip and draws `???` where the track was; the band badge, the lead line, the units row and both aria readings go with it, because each is the same figure in another form. `pollCoverageFor` picks the arm in the viewmodel, not in the component.

ADR-106 had rejected hiding the percent, but on a gate boundary and permanently; the ADR records why a four-answer hide inside one window is a different argument. `gateStake.projection` renders nowhere, so the copy names the band badge instead of a projection.
