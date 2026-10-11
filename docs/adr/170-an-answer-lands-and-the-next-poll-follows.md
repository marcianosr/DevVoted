# ADR-170: An answer lands, and the next poll follows

## Status

Accepted — 2026-10-01 (Marciano). Built from the gate-reveal prototype
(`devvoted-gate-reveal.html`). Amends [ADR-161](161-accuracy-multiplies-the-gate.md)
on what the poll screen draws under the bar.

## Context

A submitted answer used to enter a reveal: verdicts on the options, the receipt on the
payout chips, the explanation, and a **Next poll** press. The answer itself landed
silently. The bar slid, a pin popped up for 1.8s, and the player had to press on.

The answer is the core beat of the game. The prototype gives it a feel: a right answer
pulses green and flies its gain into the bar, a wrong one shakes, and the run moves on
by itself.

## Decision

1. **The poll screen advances on its own.** After a right answer it holds 1.65s, after
   a wrong one 1.9s (650ms and 900ms until 2026-10-08), so the right option can be read. Then it commits and shows the
   next poll, or closes the gate on the fifth. There is no Next press, and input is
   locked while the feedback plays.
2. **Options have three states: idle, right, wrong.** The correct option is marked
   right whether or not it was picked. The old `missed` tint is gone.
3. **A wrong answer shakes the poll card** (220ms). Nothing flies.
4. **A right answer's gain flies into the bar** as a badge (420ms). The bar holds its
   old reading until the badge lands, then moves. The gain is the coverage the answer
   added, before the accuracy multiplier.
5. **The bar is two layers on one band grid.** The dim track shows the whole ladder,
   and the lit copy is clipped to the reading, so every band reached lights in its own
   colour. A 3px marker rides the edge. The 1.8s pin is gone; the band badge in the
   panel header states the reading. Ticks sit at the gate's own boundaries, and
   narrow bars drop the band words.
6. **The row under the bar is the accuracy track**: one equal segment per poll, lit
   right, wrong, or partial by its share. No weights and no multiplier are shown,
   because the mix stays sealed (ADR-161). A skipped poll stays open, since it adds
   nothing to accuracy. The per-poll payout chips moved off the poll screen; the gate
   result still draws them.

   Amended 2026-10-02 (Marciano): five segments read as five polls, so the track is
   **one bar of the multiplier**, ×1 to ×2. A solid fill reaches the multiplier the
   window is sure of (every poll still ahead a missed multiple), and a faint fill
   reaches the best case (every one right), labelled "×1.32 · up to ×2". Both assume
   the worst-case mix, so the bar still leaks nothing sealed. A right answer pulses
   the bar.
7. **Reduced motion** plays no shake, pulse, settle or flight, and the bar jumps to
   its value.

## Consequences

- The explanation and the receipt are on screen only for the hold. The review screen
  and the gate result still carry them.
- The bar colours are derived from the Kanto band tokens (`bg-theme-dim`,
  `bg-theme-lit`), not the prototype's hex values, so themes stay one system.
- The bar's reading is a registered `<percentage>` property, so the clip, the marker
  and the pin move off one value with no animation loop.

## Rejected

- **Keep the Next press and treat the hold as a minimum.** It leaves the beat
  waiting on a click, which is what the prototype set out to remove.
- **A segment mode on the payout row.** Plain segments and receipt chips share
  almost nothing; one component would carry two jobs.

## Amendment 2026-10-04: a flying gain chip holds the advance

The gain chip's pop, hold and ride (about 1.8s) outlived the 650ms hold, so the next
poll cut it off before it landed. A right answer whose chip flies now leaves only
once the chip has ridden into the bar, and never before the 650ms hold; a 3s
fallback moves on if the chip never settles. Wrong answers, zero-gain answers and
reduced motion keep the fixed holds.

## Amendment 2026-10-08: the verdict stays a second longer

The holds grow by one second, to 1.65s after a right answer and 1.9s after a wrong
one (DVTD-fxcc). Playing it, the verdict left before it had been read. A right
answer whose chip flies was already held about 1.8s by the chip, so it barely
moves; wrong answers and chip-less right answers get the whole second.
