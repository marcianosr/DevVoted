---
# DVTD-st9v
title: The coverage bar takes its band as a prop
status: completed
type: task
priority: low
created_at: 2026-09-25T19:45:53Z
updated_at: 2026-09-30T16:42:38Z
blocked_by:
    - DVTD-dhfx
---

**What:** The coverage bar receives its band from the viewmodel instead of cutting it from its own props.

**Why:** After the gate-close slice the domain owns the one band classifier, but the bar still carries a private copy so it can draw from plain props; handing it the band removes the last duplicate cut.

## Done when
- [x] The bar takes a band prop and draws it without classifying
- [x] Every viewmodel that builds bar props supplies the band from the domain classifier
- [x] The bar's stories and specs pass the band explicitly

## Notes
Follow-up to the gate-close slice of the deepening pass. Touches every builder of `CoverageBarProps` (prep, poll, gate outcome, run over, the poll factory, the stories), which is why it is not folded into that slice.

## Summary of Changes (2026-09-30)

Landed with DVTD-dhfx (ADR-160). `CoverageBarProps.band` is required and `CoverageReading`, `BandLadder` (a `band` prop; the standing rung is the band it is handed) and `Standing` (`StandingCoverage.band`) draw what they are given; `coverageBandOf` and the kit's private `bandOf` are deleted. Builders: `stakeBarFor` (gateStake.viewmodel) for prep, poll and the run-over fallback; the close record for the debrief and run over; `bandAtLadder` in `bandOutcomes.ladderFor`, `playerCard.standingFor` and the kanto factories. Stories compute the band from the domain classifier where they drag `held`.
