# ADR-080: The swatch is won by the window, not by the clear

## Status

Accepted 2026-09-14 (Marciano, DVTD-mrnr). Reverses the award rule in
[ADR-019](019-depth-and-width-are-independent.md) Decision 3; the swatch roster,
its colours and its ordering are untouched.

## Context

Since ADR-019 a gate has handed over its swatch for clearing. Clearing is now a
band check against cumulative run coverage (ADR-073, ADR-076), so the badge was
being paid for a number that mostly reflects how the earlier gates went. A run
that opens well can coast into Boulder, Cascade and Thunder on banked coverage
while missing polls all the way up; a run that answers a deep gate perfectly but
carries a bad history takes nothing home at all.

That also left prep with one objective and three readings. The screen opened on
prose telling the player their base poll score and their coverage standing, both
of which the coverage bar under it already draws, and it never said what the day
was actually worth.

## Decision

1. **A flawless window earns the gate's swatch.** All five polls of the window
   answered right, graded on the exact-set rule, stamps the gate. Nothing else
   does.

2. **Clearing the gate and earning its swatch are separate prizes on one
   window.** The clear reads cumulative run coverage against the gate's OK line
   and moves the run on; the swatch reads this window alone and is kept for
   good. Either can land without the other: a flawless window can still close
   SHAKY on a bad history, and a comfortable clear can carry a miss.

3. **The stamp is the run's, and the run keeps a list of them.**
   `RunState.swatchGatesEarned` collects each flawless gate in the order its
   window landed, so the run-over summary can say which badges the climb took
   and the repository can award exactly the fresh ones. A gate retried and
   played clean twice is stamped once.

4. **Prep opens on the two objectives.** The band table's three prose readings
   are replaced by one line and a two-row panel: clear the gate (reach OK or
   better, gate N+1 opens tomorrow) and earn the gate's swatch (answer 5 of 5,
   kept for good). Each row reads live, so the panel says which of the two is
   already in hand before the build is committed.

5. **The prep footer stops narrating the start.** "Starting locks this build for
   the window" said nothing the Start button did not already imply.

## Consequences

**The swatch becomes the skill prize and the clear the survival prize.** They
were one reward wearing two justifications; splitting them gives a deep run
something to play for after the coverage is banked, and gives a bad run a reason
to answer the window out properly.

**Collections get slower, and deliberately so.** A player who clears every gate
of a run now goes home with only the gates they played clean. The Dex's Gates
tab and the end-of-run summary both read the earned list rather than
`gatesCleared`, so neither over-reports.

**PERFECT and a flawless window are not the same test.** PERFECT is coverage at
100% (ADR-075); the swatch is five right answers. At a deep gate a flawless
window rarely fills the bar, and a full bar does not require a clean window. The
wiki's band table said "the swatch" in the PERFECT row; it now says what that
row actually pays.

**One rule now spans the close and the repository.** The close stamps the gate,
the repository writes the fresh stamps into `users.owned_swatch_ids`. The write
stays idempotent, so a gate earned on an earlier run is not duplicated.
