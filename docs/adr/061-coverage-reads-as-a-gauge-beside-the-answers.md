# ADR-061: Coverage reads as a gauge beside the answers

## Status

Accepted — 2026-09-05 (DVTD-34r5). Amends ADR-035's per-gate coverage by giving
it a second reading surface; does not change any number.

## Context

Coverage is the run's score and the gate's bar, but while answering it was one
line in `RunHeader` — a reading the player scans past, three screens away from
the decision it should inform. The poll screen is where a config's multiplier
and a difficulty bonus actually cash out, and nothing there showed the climb.

## Decision

1. A vertical `CoverageGauge` sits in the left gutter of the poll and reveal
   screens, spanning the question through the last answer. `RunHeaderProps.coverage`
   is optional, and both screens drop it when they draw a gauge, so no coverage
   number appears twice on one screen.

2. The gauge's segments are sized against the demand, so the top edge means the
   gate's bar. It wears the gate swatch (`bg-theme`), not a fixed green: the
   gauge belongs to the gate it is measuring.

3. On the poll screen a dashed ghost appears above the fill **only once a choice
   is selected**, sized by what a correct answer pays. A standing forecast would
   read as owed coverage; tying it to the pick makes it the answer to "what is
   this worth". The value routes through `coverageForAnswer` — the function the
   scorer itself calls — times the poll's difficulty multiplier, so a
   conditional config can never show one figure here and another on the reveal.

4. On the reveal the gauge stays put and animates the settlement: what the
   answer earned scales up off the standing fill, what a miss cost scales back
   down onto it. Both run from the same bottom edge, because a loss returns the
   bar to a level, and both stop under `prefers-reduced-motion`.

5. When the run climbs past the demand the track opens to hold the surplus
   rather than clamping, and a mark is drawn where the demand fell. Clamping
   made a 5.3% standing against a 3% demand look identical to exactly meeting
   it, which is the one case where the player most needs to see they are
   overextended. The mark is drawn only when something goes past.

## Consequences

The header keeps its coverage reading on every other screen, so the gauge is a
poll-loop affordance and not a replacement for the run-wide one. A gate whose
demand is 0 renders an empty track rather than dividing by zero.

Two coverage readings now derive from `view.gateStake`, so a change to how
`coverageHeld` or `coverageDemand` are computed lands on both without edits.
DVTD-nljz (rewarding spill) and DVTD-ihao (over-100% visuals) inherit the mark
from Decision 5 as their starting point.
