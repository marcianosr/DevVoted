# ADR-044: Capacity is spots, money is KB

## Status

Accepted 2026-08-27 (Marciano, DVTD-29cm). Kept in its own vocabulary: "spots"
was renamed back to slots by [ADR-048](048-the-pipeline-is-your-build.md), which
ruled that accepted ADRs keep their dated text so the reason a word changed is
not lost.

**Live:** Decision 5 (minify), and Decision 4's principle that a build the engine
cannot fit is a screen and never a silent deletion. Decision 1's principle
survives in [ADR-047](047-a-configs-size-is-a-number.md)'s form: a config's size
is what it spends, and the size is the price.

**Dead:** Decisions 2 and 3 and both amendments, which moved width's source three
times in two days (earned on clears, then sold by the plan, then handed over by a
gate schedule); ADR-046 settled it as bought outright and
[ADR-074](074-weight-is-what-the-build-costs-to-run.md) stopped it being bought
at all. Decision 6's peel share dies with it: the peel is now whatever it takes
to make the upkeep affordable, not a fraction of the build.

## Context

A config's grade already named a number of bits, and the build already had a
width ladder measured in slots. Those were two unrelated scarcities: a `byte` and
a `bit` cost the same one slot, so the grade ladder priced nothing, and width had
to be balanced against depth as a separate axis.

Collapsing them onto KB was tried first and rejected; see
[rejected.md](rejected.md). The conclusion that mattered was not "never sell
width" — Balatro sells joker slots too — but that **width needs a ceiling, and
the ceiling should be measured in something the score cannot inflate.** ADR-046
reopened the loop deliberately and holds it with price and a cap instead.

## Decision 1: capacity is spots, and the size is the price

The mark a player already reads is the cost, so the size ladder finally prices
something. Spots are drawn as a track and **never written with a unit**, which is
what keeps them from colliding with KB and why KB needed no rename.

ADR-047 kept the principle and dropped the grades: `Config.slots` is a plain
number and the draft price is `32 KB` a slot.

## Decision 2–3: where width comes from

Dead. Read [ADR-074](074-weight-is-what-the-build-costs-to-run.md): width has no
source, because it is not held. It is rented by the gate.

## Decision 4: over-capacity is a screen, not a deletion

A build holding more than it has room for is a **legal, visible state**. The
engine never resolves it by deleting a config it did not ask about (ADR-042
pillar 2).

It routes to the peel screen, which became one screen with two entrances, a
missed gate and an overflow. Both are gone:
[ADR-071](071-the-closing-band-decides-the-gate.md) took the peel off the miss,
and [ADR-074](074-weight-is-what-the-build-costs-to-run.md) removed the ceiling
an overflow needs. The screen keeps one entrance, an upkeep bill the run cannot
pay, and the way out is drop or minify.

What survives is the rule under the table: buying your way out is allowed when
the pressure is capacity and refused when it is a penalty. Upkeep is capacity,
so paying the bill from the balance is always the first option and the peel only
fires when the balance cannot.

`isOverCapacity` no longer has anything to measure against. It goes with the
ceiling rather than staying as an invariant.

## Decision 5: minify squeezes a config into a build that cannot hold it

Minify halves a config's slots and halves what it gives, one way only. A
1-slot config cannot be minified, because one slot is already the floor and there
is nothing to squeeze.

Two rules make it a trade rather than a trick:

- **Halving a bonus means halving the part above one.** `×1.25` becomes `×1.125`,
  not `×0.625`, which would turn a bonus into a tax (`minifiedMultiplier` in
  `config.model.ts`).
- **A config's costs are never halved.** Softening a throttle would make
  minifying a buff.

## Decision 6: the peel is a share of occupied slots

Dead. The peel is sized by the upkeep bill it has to clear
([ADR-074](074-weight-is-what-the-build-costs-to-run.md) Decision 4), not by a
fraction of the build. The paragraphs below are why a share beat a count, which
is the argument to re-read if the bill-sized quota turns out to be unreadable.

A count was meaningless once configs come in several sizes: "one config" took a
quarter of an opening build or a whole 8-slot config off a summit build, for the
same word.

The share also prices width honestly. Eight 1-slot configs pay a 20% peel with
two of them and keep six, while one 8-slot config has to minify to pay at all.

**Nothing early may peel more than half the build.** Minifying everything frees
exactly half of what is occupied, so a quota inside that cap is always payable
without dropping anything, which is what stops a one-config opening dying to its
first miss. The guarantee is deliberately slack against the live rows so a retune
cannot quietly break it. Rows are ADR-037's, in `gate.model.ts`.

## Decision 7: KB is untouched

KB stays money and nothing else. ADR-043's doubled draft-cost ladder is reverted,
because the doubling existed only to make one grade equal the free cap exactly,
and once size stopped being measured in KB, keeping it would mean doubling every
faucet and fee to match: a re-denomination of the whole economy with nothing
bought by it.

## Consequences

- Two currencies that cannot be confused, because only one has a unit written on
  it.
- The size numbers are load-bearing. A config taking 8 of 8 available slots is a
  genuine dilemma at every point in a run: early it cannot fit at all, late it
  costs the whole build.
