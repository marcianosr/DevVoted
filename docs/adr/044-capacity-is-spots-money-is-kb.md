# ADR-044: Capacity is spots, money is KB

## Status

Accepted 2026-08-27 (Marciano, DVTD-29cm). Kept in its own vocabulary: "spots"
was renamed back to slots by [ADR-048](048-the-pipeline-is-your-build.md), which
ruled that accepted ADRs keep their dated text so the reason a word changed is
not lost.

**Live:** Decisions 4, 5 and 6 (over-capacity is a screen, minify, the peel is a
share). Decision 1's principle survives in
[ADR-047](047-a-configs-size-is-a-number.md)'s form: a config's size is what it
spends, and the size is the price.

**Dead:** Decisions 2 and 3 and both amendments, which moved width's source three
times in two days (earned on clears, then sold by the plan, then handed over by a
gate schedule). [ADR-046](046-slots-are-bought-storage-is-capped-again.md)
settled it: slots are bought outright.

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

Dead. Read [ADR-046](046-slots-are-bought-storage-is-capped-again.md).

## Decision 4: over-capacity is a screen, not a deletion

A build holding more than it has room for is a **legal, visible state**. The
engine never resolves it by deleting a config it did not ask about (ADR-042
pillar 2).

It routes to the peel screen, which becomes one screen with two entrances:

| Entrance | Free up | Way out |
| --- | --- | --- |
| Missed gate | a share of occupied slots | drop, or minify |
| Over capacity | the overflow | drop, minify, or buy the room back |

Buying out of an overflow is allowed; buying out of a peel is not, or missing a
gate would be free for a rich run.

`isOverCapacity` can no longer fire in a live run (ADR-046 removed the only thing
that narrowed a build). It stays as an invariant, because peel and strip still
resize builds, and the shop's exit lock still reads it.

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
