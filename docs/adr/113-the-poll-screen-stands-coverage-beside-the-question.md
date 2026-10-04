# ADR-113: The poll screen stands coverage beside the question

## Status

Accepted — 2026-09-25 (Marciano, DVTD-ktf3). Amends
[ADR-068](068-coverage-reads-as-a-ring.md), whose context reads "the kanto poll
screen is one column (no sidebar, no gutter)", and
[ADR-070](070-coverage-reads-as-a-banded-bar.md), which placed the bar in a
panel of its own above the poll. The bar, its bands and its units are unchanged:
only where the panel stands moved.

## Context

The coverage panel sat above the poll. It is tall — a banded track, a reading
line in words, and a row per poll of what this gate paid — so the question the
screen exists to ask started below the fold at every width. The screen opened on
a score, and the player scrolled to reach what they were being asked.

Pinning the panel to the top of the viewport on a phone was the previous answer
to that: the readout stayed in sight while the answers scrolled past it. It
treated the symptom. The panel still went first, and on a phone it ate the top
of the viewport for the whole poll.

## Decision

1. **The poll leads; coverage stands beside it.** One row holds both: the poll
   in a column that takes the leftover width, coverage in a fixed 24rem rail.
   The poll is first in the source, so a narrow screen stacks them in that order
   and needs no ordering utility to do it.

2. **The rail is fixed, the question column is fluid.** The readout is a known
   set of figures and a bar. Giving it a fraction of the width would stretch the
   one thing whose size is settled while squeezing the one thing whose length
   varies — a question and its options.

3. **The poll screen claims the wide cap.** Two columns do not fit inside the
   900px the run screens read at: the question column would land near 460px. The
   screen now reads at `max-w-6xl`, which the collection screens already used.
   This is the first run screen to take it, and it takes it because it now shows
   two things at once rather than one.

4. **The panel pins only where it sits beside the question.** It follows the
   answers down the page on a wide screen, which is what the phone pin was for.
   Stacked under the poll there is nothing above the answers to pin, so the
   phone pin is gone. `items-start` on the row is load-bearing: a stretched grid
   item is already as tall as its row and cannot travel inside it.

5. **The audit strip spans both columns, above the row.** An audit is a
   condition on the whole screen, not on either column, and it is short enough
   that a full-width strip costs the question nothing.

## Consequences

A phone player reaches the question immediately and meets the meter after it.
That is the trade this makes: the meter is no longer visible while they read the
options on a phone. It is visible throughout on anything wider, which is where
it was least needed before.

The wide cap applies to the whole screen, so the gate header and the build
footer widen with it.
