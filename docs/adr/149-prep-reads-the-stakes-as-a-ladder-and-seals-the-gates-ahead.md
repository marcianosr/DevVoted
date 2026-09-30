# ADR-149: Prep reads the stakes as a ladder and seals the gates ahead

## Status

Accepted — 2026-09-29 (Marciano, DVTD-2wak). Supersedes
[ADR-139](139-prep-prices-a-poll-and-draws-the-codebase.md) decisions 2 to 5,
[ADR-078](078-prep-reads-in-two-columns.md) decisions 2 and 5 and
[ADR-136](136-the-stakes-column-leads-with-the-reward.md) decision 5. Amends
[ADR-070](070-coverage-reads-as-a-banded-bar.md) decision 3 and
[ADR-106](106-the-poll-screen-reads-coverage-in-units.md) decision 3. Counts
badge under [ADR-148](148-every-number-wears-a-badge.md).

Built: `BandLadder.ui.tsx` (bar plus rows), `BandOutcomes.ui.tsx`, `Scoring.ui.tsx`,
`bandOutcomes.viewmodel.ts`, `scoring.viewmodel.ts`.

## Context

Prep said the ladder three times: a band table, a bar and a pay panel. The
strictness table quoted every gate's stakes up to the Champion, so the next gate
held nothing to find out. Marciano's mock folds the screen into At stake and
Scoring.

## Decision

1. **At stake draws the bar to scale, then a row per band.** The lines move
   every gate (OK can span 20% at gate 1 and 6% at gate 5), and only a bar drawn
   to scale shows how much room each band has. The pinned `CoverageBar` numbers
   each line under it. Below it, one row per band, worst first: the band, its
   range written out (`64.4 – 71.1`) and what finishing there pays, PERFECT last
   at `100`. The row the run stands in is ringed, read off the same number the
   pin uses. A ladder of zones with a min-width floor was built first: the floor
   made every band look the same size and pushed the ladder out of its panel.

2. **One standing line.** Under the ladder: the units to the next band up and the
   polls left in the window. The window's answers show today's gate only.

3. **What a poll pays is deleted, and Scoring folds first in the right column.**
   The strip states the codebase and what one unit pays. The body prices a single
   answer (0 or 1 unit) and a multiple answer (0 to 2 by quarter shares), then the
   two statements, then the gate table. The codebase squares, the grew line and
   the focus rows go with the panel.

4. **The gates ahead are sealed.** The player sees the stakes of the current gate
   and of the gates reached in this run, never the next gate's. The table lists
   every gate reached, the next one, a gap and the last; a sealed row keeps its
   name and shows `???` in each figure cell. Statement 2 quotes no figure past the
   current gate. Withhold, never falsify.

5. **The five polls count what is revealed.** `0 of 3 revealed` with a note that
   configs reveal it, or `3 of 3 revealed by Prefetch`. A category reads as its
   proper name, `CSS ×2` for a repeat.

## Consequences

- Coverage still appears once per screen (ADR-068, ADR-070): the bar is the
  ladder's top half.
- ADR-139's open consequence, two swatch pictures in one column, is closed: the
  codebase squares are gone.
- `coverageRungsFor` returns real edges; the rows round them to one decimal.
- The unit ladder's quarter steps illustrate a four-option poll; a three-option
  poll pays in thirds.

## Rejected

- **A legend line under the ladder.** See [rejected.md](rejected.md).
