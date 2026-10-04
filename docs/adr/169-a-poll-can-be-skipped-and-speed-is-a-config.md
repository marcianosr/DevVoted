# ADR-169: A poll can be skipped, and speed is a config

## Status

Accepted — 2026-10-01 (Marciano). Amends [ADR-161](161-accuracy-multiplies-the-gate.md):
a skipped poll is left out of the multiplier, and a streak no longer adds coverage.

Amended 2026-10-03 (Marciano): the **Skip press is withdrawn** from the poll screen.
The poll screen stated the rule ("covers nothing · keeps your multiplier · breaks the
streak") but never the stakes, and the stakes are the whole point: a skip is worth
almost nothing early in a bad window and protects ×2 late in a clean one. Until the
screen can show what right, wrong and skip each do to this window's multiplier, the
press reads as a trap. D1's rule stays in the reducer and the action schema, so
restoring the press is a presentation change only.

## Context

We checked four scoring ideas from other quiz games against ADR-161: streak
multipliers, a Kahoot time curve, placement scoring (first right answer earns most)
and negative marking (−⅓ for a wrong answer on four options, so a blind guess is worth
zero).

Every poll had to be answered, so a penalty for wrong answers would only punish:
there was no decision to make. A blind guess was always worth taking.

## Decision

### 1. A poll can be skipped

The `skip` action spends the current poll without answering it. A skipped poll:

- covers nothing;
- is **left out of the multiplier**: it adds to neither the accuracy earned nor
  the accuracy available;
- breaks the streak, the `&&` chain, Cache's run in its category, and Dependabot's count;
- forfeits the swatch, which asks for five right, and the clear KB that answer
  would have paid;
- writes no poll response, so community splits and LGTM's crowd pick count only
  answers;
- counts toward no unlock metric, and does not count as a miss for "cleared after
  two misses";
- still uses up one of the day's five polls.

It cannot be used on a poll approved for LGTM, which the room answers.

The bet a skip offers depends on how the window stands. Four polls are answered and
one single is left; the guess is worth taking above this confidence:

| answered so far | right | wrong | skip | answer beats skip above |
|---|---|---|---|---|
| 1 of 4 right | 2 × 1.32 = 2.64 | 1 × 1.15 = 1.15 | 1 × 1.19 = 1.19 | 3% |
| 3 of 4 right | 4 × 1.74 = 6.96 | 3 × 1.52 = 4.55 | 3 × 1.68 = 5.05 | 21% |
| 4 of 4 right | 5 × 2 = 10 | 4 × 1.74 = 6.96 | 4 × 2 = 8 | 34% |

A blind guess on four options (25%) is then worth about the same as a skip once the
window is going well. That is the property negative marking buys, without a penalty
rule. When the window is going badly, a skip almost never pays. Skipping cannot
carry a run: only right answers cover anything.

### 2. Vite pays for speed, as a config

Vite (2 weight): a correct answer submitted within 15 seconds earns ×1.5 coverage, a
slower one ×0.75. An answer without a time (an old client) earns ×1. It changes
poll output only, never the multiplier (ADR-161 D2). It unlocks on 25 correct answers
within 15 seconds, or 400 polls answered.

The time is the `elapsedMs` the browser already reports for 408 Request Timeout. A
modified client can fake it. That is acceptable for a solo run, and it has to be
minted on the server before any board ranks by speed.

### 3. A streak adds no coverage

The +0.1 change for every right answer after the first (`STREAK_UNIT_STEP`) is
removed. It was too small to notice, and it paid knowledge a second time on top of
the multiplier. The streak still multiplies the clear's KB. Receipts saved before
this change still show their streak row.

**Amended 2026-10-02 (Marciano): the streak no longer multiplies the clear's KB either.**
The accuracy multiplier supersedes it: a gate's right answers already raise its output,
so `1 + 0.1 × streak` paid them a second time, in KB. Only the engine applied it; prep and
the hub quoted the clear without it, so the quote came in under the payout. The run
still counts the streak for the configs that read it (`&&`, Dependabot, Cache) and for
the records board. The gate result no longer prints a "streak ×N" note.

## Rejected

- **A momentum multiplier**, rising with each right answer and cooled by a miss,
  carried across gates. The accuracy multiplier already is that curve, per gate
  (×1.15, ×1.32, ×1.52 …). A config would add only order and carry-over, and
  carry-over is the run memory ADR-161 §6 rejects. As a base rule, every right
  answer would raise two multipliers.
- **A carried accuracy meter as the core rule** (simulated 2026-10-02, rejected by
  Marciano). Accuracy carried between gates: +1 a right single, a miss cools it, each
  gate raises a cap (4 at Pallet to 24 at the Champion), and the close multiplies by
  `1 + (top − 1) × meter ÷ cap`. The engine guard's own runs, the reducer untouched
  except the multiplier, gave these win rates:

  | variant | lean .6/.8/.9 | ×2 .6/.7/.8 | ×3 .6/.7 |
  |---|---|---|---|
  | target | .00/.15/.50 | .10/.35/.70 | .25/.55 |
  | today | .00/.19/.68 | .06/.29/.71 | .47/.77 |
  | tops to ×2.25, miss −2 | .00/.35/.85 | .03/.25/.71 | .22/.65 |
  | tops to ×1.80, miss −2 | .00/.11/.59 | .02/.17/.65 | .20/.58 |
  | tops to ×1.80, miss −1.5 | .00/.13/.60 | .03/.26/.71 | .31/.71 |
  | tops to ×1.80, miss −1 | .00/.16/.65 | .09/.38/.77 | .45/.83 |

  It trades build power for knowledge rather than balancing either:
  - The miss penalty moves the ×2 and ×3 builds together, so no setting fixes the
    ×3 lead without starving the ×2 build. Separating the two builds is a config
    problem.
  - A 90% player sits at the cap for 10 to 11 of 13 gates in every variant. That is
    permanent power, which is the run memory ADR-161 §6 rejects.
- **A time curve as a core rule.** In a daily game with code in the questions,
  speed measures reading and typing, punishes phones and slow readers, and rewards
  a fast lookup.
- **Negative marking without a skip.** With every poll forced, it only punishes.
- **Placement scoring as coverage.** In a daily game, "first" means first awake in
  your timezone. It may return on the community layer.

## Consequences

Engine win rates (ADR-161 §6's guard: 300 runs a cell, spread pool, build from
gate 0, shop skipped), before and after removing the streak step:

| build | accuracy | target | before | after |
|---|---|---|---|---|
| lean (four focus configs) | .6 / .8 / .9 | .00 / .15 / .50 | .00 / .19 / .67 | .00 / .19 / .68 |
| ×2 (AGENTS.md) | .6 / .7 / .8 | .10 / .35 / .70 | .10 / .37 / .69 | .06 / .29 / .71 |
| ×3 (+ Intellisense) | .6 / .7 | .25 / .55 | .43 / .71 | .47 / .77 |

The "after" column also includes the PERFECT bonus now being paid and Dry Run
leaving the roster. ×2 at 70% sits .06 under the target. The lines stay as they
are until a playtest says otherwise (ADR-161 §6: only numbers change, and only on
playtest evidence). The sim plays no skips, so skipping is not yet balanced.
