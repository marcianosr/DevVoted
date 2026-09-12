# ADR-075: A gate closed at full coverage pays a bonus

## Status

Accepted — 2026-09-12 (Marciano, DVTD-4u3o). Added the fifth outcome to a band
ladder that [ADR-076](076-the-closing-band-decides-what-it-costs.md) now owns.
Decision 3's "the swatch is untouched" consequence is reversed there: a perfect
clear marks its swatch.

**Stated, not routed**: the prep and gate-outcome screens name the outcome and
the payout is live, but `survivesGate` still answers with one boolean and
nothing reads the band to resolve a gate.

## Context

PERFECT already existed everywhere except in what it does. `bandFor` returns it
at coverage of 100%, [ADR-070](070-coverage-reads-as-a-banded-bar.md) Decision 3
calls it "the existing PERFECT band at 100%" and paints the bar blue there, and
`BandOutcomes` renders the row correctly. Nothing said what closing there wins,
and nothing paid for it.

Nothing paid for it because `payoutRatioFor` caps the overshoot. At gate 0 the
healthy line is 5%, so the cap binds at 7.5% coverage: filling the bar to 100%
pays exactly what 7.5% pays. At gate 12 the line is 95%, so the ratio only ever
reaches 1.05 and perfect is worth a rounding error over merely healthy. At both
ends of the run the top of the scale is invisible, which is the same mistake
ADR-076 names: a rung the player can see but cannot feel teaches them to ignore
it.

## Decision

1. **PERFECT is coverage reaching 100%**, which is the rule `bandFor` already
   uses. It is not "every poll landed": filling the bar takes all five right
   *and* roughly a four-times multiplier build, at every gate alike, because
   [ADR-073](073-coverage-is-a-flat-gain-reset-every-gate.md) made the gain
   flat. One definition, so the bar and the outcomes table cannot disagree about
   what the word means.

2. **It clears the gate exactly as HEALTHY does.** The swatch is won and the
   next gate comes tomorrow. ADR-076 owns the rest of the ladder.

3. **It pays a bonus on top of the capped payout.** The multiplier is
   `PERFECT_BONUS` and it rides inside `gatePayoutKb` alongside the streak, so a
   full bar and a long streak compound rather than one replacing the other. Live
   numbers stay in `coverageRatio.model.ts`.

## Consequences

**The bonus multiplies instead of raising the cap**, which is the only shape
that pays at the gates where perfect is hardest. Lifting `PAYOUT_RATIO_CAP` does
nothing at gate 12, where coverage over the line is 1.05 and the cap was never
the binding constraint.

**It stacks on the ceiling the opening gates were given to stop them printing.**
A perfect gate 0 pays the cap and the bonus together. That is reachable only
with the multipliers ADR-073 Decision 3 puts out of an opening build's reach: a
bare build earns 25% in a five-poll gate, so the bar cannot be filled until the
build can quadruple it. If a starting hand ever can, this bonus is the first
knob to turn, not the cap.

**HEALTHY now stops below full.** Its range reads to 99% rather than to 100%, so
the two rows do not both claim the top of the scale. The bands themselves are
unchanged: `bandFor` has always handed 100% to PERFECT.

**The swatch is marked after all.** This ADR left a perfect clear winning the
same swatch as a healthy one, on the grounds that marking it carried a trap.
[ADR-076](076-the-closing-band-decides-what-it-costs.md) answers it: the mark is
`.legendary-ring` composed over the gate's own themed fill, never a swap to
`finish: "fill"`, which has no theme colour and would strip the screen of its
own.
