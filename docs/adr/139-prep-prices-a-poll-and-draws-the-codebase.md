# ADR-139: Prep prices a poll and draws the codebase

## Status

Accepted — 2026-09-29 (Marciano, DVTD-ot4g). Supersedes
[ADR-078](078-prep-reads-in-two-columns.md) decisions 5 and 10 and amends
[ADR-106](106-the-poll-screen-reads-coverage-in-units.md) decision 3.

Built: `PollPays.ui.tsx`, `Codebase.ui.tsx`, `GateStrictness.ui.tsx` and
`pollPays.viewmodel.ts`.

## Context

Coverage is units over every slot the run has opened, and a clear opens five
more. The same units read a lower percent on the next prep, and that read as
loss twice in play. The poll screen's explanation was cut as the fourth place to
say it (DVTD-p82p); the debrief and the shop say it in one line each. Prep, the
first screen in the new denominator, showed neither the arithmetic nor what one
answer is worth there.

## Decision

1. **The slots a run has opened are the codebase.** A unit covers one slot of
   it; coverage is units over the codebase. "Test suite" was rejected: tests
   cover code, nothing covers a suite. The player's answers are the tests and
   the gate is the check.

2. **Prep gets a What a poll pays panel.** It draws the codebase as one square
   per slot, coloured by the gate that opened it, covered squares filled and
   today's five dashed. From the second gate on, one line states the codebase
   grew and that the same units read yesterday's percent and today's. At the
   first gate it reads the poll screen's scored sentence.

3. **The coverage bar leaves At stake for that panel.** At stake keeps the
   objectives, the window's answers and the band table. Its edged row is read
   off the bar's numbers by the viewmodel, so the two cannot disagree.

4. **The panel prices a single answer, a single in each installed focus config,
   and a multiple answer**, in units and as a signed share of the codebase, and
   states in units what the clearing band still asks. Prep speaks units in this
   one panel; the bar and the band table keep the percent.

5. **Gate strictness is a fold drawn shut**, last in the left column. Two
   statements read off the rung table, and a row each for the first, second,
   current and last gate: slots, what one unit pays, the HEALTHY line.

## Consequences

- Prep prices a step and a landing on one screen, which ADR-078 called
  doubling. The step is in units and the landing in KB; they answer different
  questions.
- The line does not rise for the first four gates. The statement is derived from
  `GATE_RUNGS`, so it says so rather than claiming later gates always ask more.
- The owed figure is read off the one-decimal percent ladder, so it is stated
  to one decimal.
- PollScores stays inside At stake, so two swatch pictures share the column. If
  that reads as doubling, PollScores leaves prep.

## Rejected

- **"Test suite" as the name of the pool.** See [rejected.md](rejected.md).
- **A second bar on prep.** Coverage appears once per screen (ADR-068, ADR-070).
