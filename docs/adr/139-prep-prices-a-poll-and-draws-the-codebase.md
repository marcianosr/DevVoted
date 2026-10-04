# ADR-139: Prep prices a poll and draws the codebase

## Status

Accepted — 2026-09-29 (Marciano, DVTD-ot4g). Supersedes
[ADR-078](078-prep-reads-in-two-columns.md) decisions 5 and 10 and amends
[ADR-106](106-the-poll-screen-reads-coverage-in-units.md) decision 3. Decisions
2 to 5 superseded the same day by [ADR-149](149-prep-reads-the-stakes-as-a-ladder-and-seals-the-gates-ahead.md);
decision 1 stands.

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

2. **Prep gets a What a poll pays panel.** Superseded by [ADR-149](149-prep-reads-the-stakes-as-a-ladder-and-seals-the-gates-ahead.md): the panel is deleted.

3. **The coverage bar leaves At stake for that panel.** Superseded by [ADR-149](149-prep-reads-the-stakes-as-a-ladder-and-seals-the-gates-ahead.md): At stake draws the ladder.

4. **The panel prices a single, a focus and a multiple answer.** Superseded by [ADR-149](149-prep-reads-the-stakes-as-a-ladder-and-seals-the-gates-ahead.md): Scoring prices a single and a multiple answer as unit ladders.

5. **Gate strictness is a fold drawn shut.** Superseded by [ADR-149](149-prep-reads-the-stakes-as-a-ladder-and-seals-the-gates-ahead.md): Scoring folds first in the right column and seals the gates ahead.

## Consequences

- Prep prices a step and a landing on one screen, which ADR-078 called
  doubling. The step is in units and the landing in KB; they answer different
  questions.
- The line does not rise for the first four gates. The statement is derived from
  `GATE_RUNGS`, so it says so rather than claiming later gates always ask more.
- The owed figure is read off the one-decimal percent ladder, so it is stated
  to one decimal.
- PollScores stays inside At stake, so two swatch pictures shared the column.
  Closed by ADR-149: the codebase squares are gone.

## Rejected

- **"Test suite" as the name of the pool.** See [rejected.md](rejected.md).
- **A second bar on prep.** Coverage appears once per screen (ADR-068, ADR-070).
