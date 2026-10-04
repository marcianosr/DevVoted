# ADR-172: All-coverage bonuses add, they do not compound

## Status

Accepted — 2026-10-02 (Marciano). Amends the multiplier term in
[ADR-083](083-a-coverage-config-multiplies-or-adds-units.md)'s payout formula. Follows the
carried-accuracy rejection in [ADR-169](169-a-poll-can-be-skipped-and-speed-is-a-config.md).

## Context

ADR-161's engine guard has shown one cell far off its target since it was written.
AGENTS.md (×2) with Intellisense (×1.5) multiplied to ×3 for 12 weight. That build
summited 47% of runs at 60% accuracy against a .25 target, and 77% at 70% against .55.
A build carried a weak player.

The carried accuracy meter could not fix it. Every setting that pulled ×3 down also
starved the ×2 build, because both builds amplify the same meter. The fix has to sit
where the two builds differ, which is how the configs combine.

Three config-side options, through the guard's own runs:

| option | ×3 at .6 / .7 | stacked with Deprecated .5 / .7 |
|---|---|---|
| target | .25 / .55 | under .3 / close to ×3 |
| today (product) | .47 / .77 | .07 / .75 |
| **bonuses add** | **.24 / .57** | .02 / .53 |
| only the strongest counts | .07 / .31 | .00 / .32 |
| Intellisense at 6 weight | .47 / .77 | .07 / .75 |

Weight does not bind at these build sizes, so a price change does nothing. Taking
only the strongest bonus overcorrects: pairing two configs would stop paying at all.

## Decision

1. **An all-coverage multiplier is a bonus that pools.** "All coverage earns ×N" (a
   config's `coverageMultiplier`: AGENTS.md, Intellisense, Deprecated and A/B Test's arm
   A) adds N − 1 to a pool that starts at 1. The answer is multiplied by the pool once.
   AGENTS.md with Intellisense pays ×2.5, and AGENTS.md beside a fresh Deprecated pays ×4,
   not ×6.
2. **Every other multiplier still compounds.** Category focus, the opener and throttle
   terms, Regression Test and Vite multiply as before. Each one is conditional on the
   poll, so it rewards building around the run rather than stacking.
3. **The pool never goes below 0.** A Deprecated faded under ×1 takes from the pool
   instead of halving it: AGENTS.md beside Deprecated at ×0.5 pays ×1.5.
4. **Flat adds stay outside the build's multipliers** (ADR-083). They still sit in the
   gate's output, so ADR-161's accuracy multiplier scales them, the strict wager
   included. *Amended 2026-10-02: this used to say "every multiplier", which the code
   never did.*
5. **The receipt itemises the pool.** Each config's row is its share of the pool times
   what the compounding multipliers left, so the rows still sum to what was paid. Each
   pooling config's description ends "Adds to other all-coverage bonuses, never
   multiplies them."

## Consequences

The formula is `base × share × credit × mults × pool + adds`. Lean, ×2 alone and
Intellisense alone are unchanged: a single bonus pools to itself. Receipts saved
before this change keep their stored rows.
