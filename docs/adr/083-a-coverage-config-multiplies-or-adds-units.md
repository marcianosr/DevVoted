# ADR-083: A coverage config either multiplies the answer or adds flat units

## Status

Accepted, 2026-09-15 (Marciano, DVTD-rftc). Amends the earn formula fixed by
[ADR-073](073-coverage-is-a-flat-gain-reset-every-gate.md) Decision 1 and
restated by [ADR-081](081-a-multiple-choice-answer-pays-double.md) Decision 1.
Leaves [ADR-079](079-a-partial-answer-pays-a-quarter-at-a-time.md) whole: the
share ladder is not read by anything here.

## Context

The engine scores in units. A correct single pays one, a multiple pays two, and
a partial pays its rung. Two configs never followed it there.

Code Coverage carried `coverageAdd: 0.1` and Cache carried `cacheHitStep: 0.25`,
and both landed inside the multiplier product:
`buildMultiplierOf = Pi(mult) x (1 + Sum(add))`. So what Code Coverage paid
depended on what else was installed: 0.1 units on its own, 0.2 on a multiple,
0.4 stacked with AGENTS.md. Cache was worse, because its whole effect was a
multiplier that grew with the category's warmth.

A config that cannot state what it pays cannot be reasoned about before it is
bought. The shop asks the player to price a config against a slot cost, and the
honest answer under the old algebra was "it depends on the rest of your build".

The chip made it concrete. `headlineFigureOf` returned `{ kind: "coverage" }`
for Code Coverage, `figureLabel` had no branch for that kind, and the fall
through printed `+0.1 KB`: a coverage bonus labelled as storage.

## Decision

1. **A coverage config either multiplies the answer or adds flat units to it,
   never both at once.** `buildMultiplierOf` is the multiplier product alone.
   `flatUnitsOf` sums the adds. The earn is
   `BASE_UNIT x share x credit x mults + adds + streak step`.

2. **A flat add sits beside the streak step.** `streakUnitBonus` was already a
   flat unit term added after the multipliers, and an add is the same kind of
   thing. Nothing amplifies either of them.

3. **An add pays on any answer that scores.** `coverageForAnswer` returns zero
   when the share is zero, so a wrong answer pays nothing and a partial pays the
   full add. A three quarter catch on a multiple with Code Coverage pays 1.6, a
   clean single with it pays 1.1, so the ladder keeps its order.

4. **Cache pays units.** `cacheMultiplierFor` is replaced by `cacheUnitsFor`,
   returning `step x min(hits, CACHE_HIT_CAP)`. Four cached hits pay one unit
   where they used to double the answer.

5. **The numbers do not move.** `coverageAdd` stays 0.1 and `cacheHitStep` stays
   0.25. A multiplier of x1.1 applied to a one unit base is the same thing as
   adding 0.1 units, so a correct single pays exactly what it paid before. The
   roster is not edited.

6. **Units are halved when minified, never floored.** `minifiedAmount` floors,
   because it was written for KB and KB stays whole. Coverage units are
   fractional by design, so `Math.floor(0.1 / 2)` was quietly zeroing a minified
   Code Coverage rather than halving it. `minifiedUnits` halves without
   flooring, and every coverage add now routes through it.

7. **The poll screen names what it counts.** `coverageLeadFor` compared a unit
   count against a slot count with "out of" between them, which read as a bug
   whenever a multiple pushed the score past the slots opened. It now reads
   "You have scored 18 units across 15 slots", singular at exactly one.

## Consequences

An add is weaker whenever a multiplier is also installed, because it no longer
rides the product. This is the trade taken on purpose: a figure the player can
read off the chip is worth more than a figure that compounds invisibly.

| Build | Before | After |
| --- | --- | --- |
| Correct single, Code Coverage | 1.1 | 1.1 |
| Full multiple, Code Coverage | 2.2 | 2.1 |
| Full multiple, plus AGENTS.md | 4.4 | 4.1 |
| Correct single, Cache at four hits | 2.0 | 2.0 |
| Full multiple, Cache at four hits | 4.0 | 3.0 |

Cache on a select-all is the largest move, losing a full unit at the cap. It was
the config that gained most from ADR-081 without being designed for it. If it
reads too harsh in play the lever is `cacheHitStep`, not the algebra.

`coverageFactors.build` is now the multiplier product alone and no longer
carries the adds. ADR-081 already noted that `coverageFactors` is not a complete
reconstruction of what an answer paid; it is less of one now. Anything wanting
the real figure reads `coverageEarned`.

A config that both multiplies and adds would have its add dropped from the
breakdown attribution, because `coverageBreakdownForAnswer` branches on
`mult !== 1` and only reaches the add branch otherwise. No config in the roster
does both, so this is latent rather than live, and it is filed rather than
fixed here.

Cache still has no `headlineFigureOf` branch, so its chip figure is empty. That
mattered less when its effect was contextual; now that it pays a statable flat
figure it is worth giving it one.
