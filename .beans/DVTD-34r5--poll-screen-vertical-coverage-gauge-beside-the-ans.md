---
# DVTD-34r5
title: 'Poll screen: vertical coverage gauge beside the answers'
status: completed
type: feature
priority: normal
created_at: 2026-09-05T20:28:09Z
updated_at: 2026-09-05T20:42:02Z
parent: DVTD-tduu
---

The poll screen shows coverage only in the shared RunHeader. Replace it on this
screen with a vertical gauge in the left gutter, spanning question through
answers: demand at the top, held at the bottom, and a dashed ghost segment that
appears once a pick is made showing what a correct answer adds.

Decisions (2026-09-05, with Marciano):
- The dashed block previews THIS pick (appears on select), not a standing forecast.
- The gauge replaces the header coverage readout on the poll screen; no number twice.

## Todo
- [x] CoverageGauge.ui.tsx in terminal-theme (held / demand / pending / earned segments)
- [x] Story + spec
- [x] RunHeader coverage becomes optional
- [x] PollScreen renders the gauge and drops the header coverage
- [x] PollView wires held, demand and per-correct through the scorer's own function
- [x] lint / typecheck / tests
- [x] RevealScreen keeps the gauge and animates the settlement

## Summary of Changes

CoverageGauge.ui.tsx is a vertical track that sizes every segment against the gate demand, so the top edge always means "gate cleared". Bottom-up: the standing fill, then whatever the answer just settled, then a dashed ghost, then headroom. Fill and ghost both wear bg-theme/border-theme so the gauge takes the gate swatch; a loss slice is cinnabar. Both labels carry a percent sign.

The poll screen shows the ghost only once a choice is selected, sized by coverageForAnswer routed through the scorer's own function times the poll difficulty multiplier. The reveal screen keeps the gauge in the same gutter and animates the settlement: gauge-earned scales up off the standing fill, gauge-lost scales back down onto it, both from the same bottom origin, both silenced under prefers-reduced-motion.

RunHeaderProps.coverage is now optional. Both screens hide it when they render a gauge, so no coverage number appears twice.

## Follow-up

- The overshoot mark (Decision 5 of ADR-061) is the starting point DVTD-ihao and
  DVTD-nljz inherit. Neither is closed by this work: nothing yet *rewards* the
  spill, the gauge only shows it.
- CHANGELOG.md is mid-conflict (UU) in the working tree, so the player-visible
  entry for this was not written.
