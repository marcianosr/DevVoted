---
# DVTD-kmch
title: The debrief states what you earned and why the build moved
status: in-progress
type: feature
priority: normal
created_at: 2026-09-29T17:58:36Z
updated_at: 2026-09-29T18:10:47Z
---

**What:** The gate debrief gains an Earned panel (new configs, new titles, the swatch) and Build changes lists each moved config with its reason.

**Why:** The player should read what a gate gave them and what is about to rot in one glance, instead of a header sentence and bare chips.

## Done when
- [x] A gate clear lists every config unlocked and title earned on it, and they survive a reload
- [x] The swatch is stated once, in the Earned panel, with its right count
- [x] Build changes lists expiring, upgraded and removed configs, each with a reason and a badge
- [x] Both panels fold to one line when nothing happened

## Notes
- Titles are granted at every gate close, not only at run end.
- Payout panel is out of scope.
- Plan: ~/.claude-work/plans/redesign-some-panels-in-linear-pumpkin.md

## Summary of Changes

- closeGains.model: unlocks held until the close, then stamped with titles on the close entry.
- run.repository: titles granted at every gate close, not only at run end.
- gateGains.viewmodel: reads a gate's gains from its last close.
- gateOutcome.viewmodel: Earned panel, reasoned Build changes rows, swatch header line and badge removed.
- GateOutcomeScreen.ui: one OutcomeRow shape for both panels; Fold gained a flush body.
- ADR-154, wiki, changelog.
