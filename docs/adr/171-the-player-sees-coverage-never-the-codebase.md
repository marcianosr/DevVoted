# ADR-171: The player sees coverage, never the codebase

## Status

Accepted — 2026-10-02 (Marciano). Supersedes the player-facing use of
[ADR-139](139-prep-prices-a-poll-and-draws-the-codebase.md)'s codebase count,
and [ADR-170 (swatch)](170-a-swatch-is-earned-by-covering-every-change.md)
decisions 3 and 4. ADR-170 decisions 1 and 2 stand: a full bar earns the swatch.

## Context

A gate's codebase (`scoringSlotsAt`, 9 at Pallet up to 11 at the Champion) is a
balance divisor. Five polls can produce about ten coverage units once the accuracy
multiplier applies. A five-unit denominator reached PERFECT too early. Nine makes
one right single worth 11.1 points.

Calling those nine slots "changes" made players ask what the changes were, and why
Boulder ships nine of them. Then the poll bar started counting the multiplier as a
guaranteed floor (ADR-161, amended 2026-10-02), and the covered count turned
fractional: "You have covered 1.08 of 9 changes".

A player needs four things: their coverage, the band they need, what an answer adds,
and how accuracy and configs raise it. The denominator is none of them.

## Decision

1. **Coverage reads in percent, gains in points.** No player-facing line states the
   codebase size or a count of changes. The word stays in code (`scoringSlotsAt`,
   `GATE_RUNGS`) and in this ADR trail.
2. **Points are per gate.** "+11.1 pts" for a right single comes from the gate's
   codebase, so later gates read +10.0 and +9.1. No surface hard-codes a gain.
3. **Every surface, after the change:**
   - **Poll lead:** "You hold 12.0% coverage."
   - **At stake:**
     - It opens on the brief: "A right single starts at +11.1 pts", then "a multiple up
       to +22.2 pts · accuracy and configs add more".
     - The box per change is gone.
     - The objectives are "Finish at OK (25%) or better" and "Reach 100% coverage". The
       band and its line are stated together.
     - The standing line reads "+9.9 pts to reach OK · 3 polls left".
   - **Prep Scoring:**
     - The strip reads "single +11.1 pts · multiple up to +22.2 pts · accuracy up to ×2".
     - The statement about the gate's codebase is gone. The multiplier curve and the
       line stay.
     - The table drops its "changes" column and heads "right single".
   - **Gate result:**
     - The swatch row reads "needs 100% coverage" with the held percent, and has no box
       track.
     - Under the bar, the gate result lists the next gate's rates, one row each with
       its gain badged ("At Cascade": single choice +10.0%, multiple choice +20.0%).
       This is where a player sees the gates harden. (Amended 2026-10-02: first a
       one-line note.)
   - **Run-over:** "final coverage" and "held at the close", next to the percent.
   - **Dex:** "A swatch is earned by reaching 100% coverage at its gate."

## Rejected

- **Keeping the boxes without a number.** Nine boxes against eleven still state the
  divisor, only less legibly.
- **"Build coverage to OK or better" as At stake's opening line.** It repeats the clear
  objective directly below it.

## Consequences

The gate's growing difficulty shows up only as smaller points per right answer and
higher band lines. The Scoring table's "right single" and HEALTHY columns carry it
gate by gate.
