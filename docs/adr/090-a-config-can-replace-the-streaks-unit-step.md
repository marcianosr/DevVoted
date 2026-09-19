# ADR-090: A config can replace the streak's unit step with a growing one

## Status

Accepted, 2026-09-16 (Marciano, DVTD-baxt). Amends
[ADR-083](083-a-coverage-config-multiplies-or-adds-units.md): the streak step
was the one figure ADR-083 placed outside both of its two kinds, and it is now
something a config can buy. Leaves the gate's KB payout multiplier
(`streakMultiplier`) untouched.

## Context

The streak pays into two meters. On the coverage meter every correct answer
after the first adds a flat `STREAK_UNIT_STEP` of 0.1 units, outside the
multipliers. On the gate's KB payout it multiplies, `1 + 0.1 x streak`, capped
at x2 and liftable by a config's `streakCapSteps`.

So the streak was already half-purchasable: a config could buy a longer climb on
the payout, and nothing at all on the meter. `streakCapSteps` has been typed and
consumed by `streakCapStepsFor` since ADR-074 with **zero roster users**, which
says the axis was reached for and then never sold.

The flat step is also the only coverage figure in the engine that does not scale
with anything. Every other term reads something: the share reads the answer, the
credit reads the poll type, the multipliers read the build. The step reads only
whether a streak exists at all, so a streak of two and a streak of nine pay the
same.

Meanwhile the roster sells coverage magnitude four ways and **sequence** zero
ways. Every coverage config pays the same whatever order a window arrives in.

## Decision

1. **A config may buy a `streakStepGrowth`, and the step then climbs with the
   streak.** `streakUnitBonus(streakBefore, growth)` returns
   `growth x streakBefore` instead of the flat constant. `.reduce()` buys 0.25,
   so a clean window pays 0.25, 0.50, 0.75, 1.00 where a bare build pays four
   tenths. The name is the mechanic: `Array.prototype.reduce` folds each step
   into a bigger accumulator.

2. **It replaces the flat step, it does not stack with it.** One streak, one
   step. A config that made the two additive would need the player to hold both
   figures in their head to read a receipt row that states one number.

3. **The step stays outside the multipliers.** ADR-083's split is untouched and
   its argument survives intact: inside the stack a x6 build would turn the
   +1.00 fourth step into +6.00 and the streak would stop rewarding accuracy.
   Growth changes how fast the step climbs, never what amplifies it.

4. **The climb is clamped to `SLICE_WINDOW - 1` steps.** The five-poll window is
   the natural ceiling and needs no separate dial, but the streak is **not**
   reset by a failed gate (only by a clear, in `closeWindow`), so a retry can
   walk in carrying four. Without the clamp its opening answer would pay a step
   no window could ever have earned, and the deeper the run the more often that
   happens.

5. **A level buys a steeper climb, not a longer one.** `streakStepOf` adds 0.05
   per level, so `.reduce()` pays 0.25 a step at L1 and 0.45 at L5. Lengthening
   the climb instead would have meant raising the Decision 4 clamp above the
   window, which reintroduces exactly the carried-streak problem it exists to
   close.

6. **It reads on the existing streak row, not as a config chip.**
   `CoverageBreakdown.streakBonus` is already a first-class field with its own
   receipt row. `.reduce()` changes the number in it. Splitting the growth into
   a separate `configBonuses` entry would state the same unit twice and break
   the row's one honest property, that base + streak + configs is the paid
   total.

## Consequences

The roster gains its first config that rewards **order** within a window. Four
correct answers pay 2.5 units of step in a row and 0.4 if a miss splits them,
so `.reduce()` is the first coverage buy whose value depends on sequence rather
than magnitude. That makes `git rebase -i` (which owns poll order) a genuine
partner rather than a curiosity, alongside Cold Start, Overclock, Cache and
Dependabot.

It is also the roster's sharpest accuracy tax. At two slots it pays more than
Intellisense across a flawless window and less than nothing across a ragged one,
which is the variance-not-magnitude shape Overclock sells at four slots.

`streakCapSteps` stays dead. It lifts the payout ceiling, which is a different
meter and a different mechanic, and folding the two would have coupled the
coverage climb to the KB cap for no design reason.
