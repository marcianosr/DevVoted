# ADR-070: Coverage reads as a banded bar on the kanto poll screen

## Status

Accepted — 2026-09-12 (Marciano, DVTD-afyx). Amends
[ADR-068](068-coverage-reads-as-a-ring.md): the ring still ships, still has its
stories, and `Header` still takes it. The poll screen takes the bar instead.

## Context

ADR-068 put a donut on the poll header. A donut draws one number against one
demand, which was the whole ladder when the gate asked a single question: did
you reach the bar.

The gate now asks four. A run closes against a floor, an OK line and a HEALTHY
line, with the 100% cap above them, and the answer to "am I safe" is different
from "am I clear". The ring could show the run's percentage against any one of
those, so it showed the one that kills you and left the other two invisible. A
player one answer from surviving and a player one answer from clearing read the
same dial.

## Decision

1. **The track is the ladder.** `CoverageBar` draws four zones sized by the
   gate's own thresholds — `0→floor`, `floor→OK`, `OK→HEALTHY`, `HEALTHY→100` —
   with the boundaries named underneath. A linear track has room for four rungs
   where a circle has room for one, which is the argument ADR-068 decision 3 lost
   when it moved coverage into a ring.

2. **Each band keeps its colour, and the fill wears the band it is standing in.**
   Red danger, orange shaky, yellow OK, green healthy, blue at 100%. The zones
   stay lightly tinted; the fill is the same hue at higher opacity with a bright
   leading edge, so the position reads even at zero.

3. **Blue is a fill state, not a zone.** "Over the goal" is the existing PERFECT
   band at 100%, not a new threshold between HEALTHY and full. Inventing a fifth
   line would have meant a number no rule uses, and HEALTHY has no upper bound to
   split.

4. **The colour map lives in the `.ui` file.** `COVERAGE_BAND_COLOR` sits beside
   the component the way `VERDICT_COLOR` does in `Verdict.ui.tsx`, and the band
   is derived from the four numbers rather than imported. `src/ui` may take types
   from `src/modules` but never runtime values (the `ui-takes-types-not-values`
   rule in `.dependency-cruiser.cjs`), so a component that needs a value either
   copies it or takes it as a prop. The bar takes its ladder as props and imports
   nothing.

5. **Coverage still appears exactly once per screen, still enforced by the
   type.** `HeaderReading` becomes a three-armed union — `ring | bar | coverage`
   — rather than the bar arriving as a second optional prop. ADR-068 decision 1
   made that invariant unbreakable; adding a shape to it must not quietly hand it
   back.

## Consequences

The bar animates its width the way the arc animates its offset, and for the same
reason: a wrong answer bleeds coverage back down, so a fill and a drain have to
look alike.

It runs off `--coverage-bar-duration` rather than the ring's
`--coverage-duration`, which is duplication with a reason.
`CoverageRing.spec.tsx` counts occurrences of the ring's variable across the
whole stylesheet to prove the arc and the digits cannot desync. A third user of
that name would have broken the proof rather than the property, and loosening a
passing assertion to make room for new code is how a guarantee quietly stops
being one.

The bar is not themed by the screen. Every other kanto element inherits the
gate's colour; this one carries five fixed hues, because a danger band that
turns green on a viridian gate is worse than an inconsistent one. `AcrossThemes`
exists to prove it.

The bar takes the gate's real thresholds as of 2026-09-13 (DVTD-1zzz).
`gateLadderFor` in `gate/domain/gate.model.ts` returns `floorAt` / `okAt` /
`healthyAt` in percent, scaled by any audit on the gate, and the four consumers
pass it straight through. `gateBand.viewmodel.ts`, which faked one geometry for
every gate, is deleted.

One clamp survives it, in `gateOutcome.viewmodel.ts`. `gatePassed` refuses a bare
build however much it covered, so a closed gate's reading and its verdict can
disagree; `closedBarFor` holds the reading to the band the verdict reached, since
decision 4 derives the screen's band from the bar.
