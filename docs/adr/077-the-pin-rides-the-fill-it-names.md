# ADR-077: The pin rides the fill it names

## Status

Accepted — 2026-09-12 (Marciano, DVTD-k5oz). Amends
[ADR-070](070-coverage-reads-as-a-banded-bar.md): the bar drew a fill that moved
and never said what it moved to. Builds on
[ADR-068](068-coverage-reads-as-a-ring.md) decision 4, whose CSS count-up is the
mechanism reused here.

## Context

`CoverageBar` already animated its width. What it never did was state the
figure, so a bar that jumped from one position to another read as a redraw
rather than as a cost or a payment. A miss bleeds coverage backwards, and a
silent backwards jump is the one the player most needs explained.

The bar had just grown a `pin`: a band-coloured label with a stem, standing at
the fill's leading edge, marking where a closed gate landed. That is the same
element a moving readout wants, in the same place, for the opposite moment.
Building a second one beside it would have put two labels on one edge.

## Decision

1. **One element, two moods.** The pin is drawn whenever the bar is, in a row it
   always reserves. A closed gate holds it up for good; a running meter shows it
   only while the figure is moving. `data-shown` carries the mood and the CSS
   fades on it, so there is one class, one position and one colour rule rather
   than a widget per moment.

2. **The row is always reserved.** The pin sits in its own `h-5` band above the
   track rather than overlaying the caption. A transient label that overlaps the
   line above it makes the caption unreadable exactly when the player is reading
   the number, and a row that appears on an answer would shift the track under
   the eye that is watching it.

3. **The moving pin counts; the settled pin states.** A running meter climbs its
   digits with `--coverage-count`, the registered property the ring already
   uses. The duration is `--coverage-bar-duration`, shared with the fill, so the
   figure cannot land before the edge it stands on. A closed gate has nothing to
   count towards and prints its tenth as text.

4. **The moving pin counts in whole percent**, where the ring keeps a static
   tenth beside its animated whole. `counter()` renders integers, so a tenth
   next to a climbing whole holds the final digit the entire way up: a climb
   from 65 to 72.4 would read 65.4, 66.4, 67.4. On a hero dial that is a
   footnote. On a label riding a moving edge it reads as a stuck digit.

5. **Visibility is React state, and it is the only JavaScript involved.** The
   move is caught during render by comparing the last reading to the current
   one; a timer only spends the hold. All motion stays CSS, so ADR-068's "no
   `requestAnimationFrame` anywhere" still holds.

## Consequences

**A keyframe would have been simpler and is not available.** Replaying a
keyframe needs the element remounted, and a remount resets `--coverage-count` to
its registered `initial-value` of 0, so the pin would count from zero on every
answer instead of from the figure it left. Keeping the element mounted and
fading it with a transition is what lets CSS supply the previous value on its
own. Nothing has to pass the old reading in, which is why the pin takes no new
prop and every screen already embedding a bar gained the behaviour unedited.

**The fill now takes 700ms rather than 400ms.** 400ms is legible for a bar and
too short to read a number that is still changing. Both run off the one
variable, so they cannot be tuned apart.

**One existing assertion changed meaning.** `CoverageBar.spec` proved the pin
"stays off the track while the meter is still running" by asserting the element
was absent. Under decision 1 it is present and hidden, so the test now asserts
`data-shown` is false. The guarantee is the same one; only its mechanism moved.

**The reduced-motion guard stays a single rule block.** Both coverage specs find
their guard with a regex that matches only a guard holding one nested rule, so
the new selectors joined the existing list rather than opening a second block.
`--coverage-duration` is still used exactly twice, which is what
`CoverageRing.spec` counts to prove the arc and its digits cannot desync.

**Screen readers get a `status` region.** The pin is `aria-hidden` under the row
it lives in, and the track's `role="img"` label does not announce when it
changes, so a moving meter would have been silent. A closed gate has no region:
nothing is moving to announce.
