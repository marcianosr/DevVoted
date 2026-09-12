---
# DVTD-815w
title: 'Configs: Memory Pressure and Headroom (pipeline occupancy axis)'
status: draft
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-30T07:40:36Z
updated_at: 2026-09-12T12:58:03Z
parent: DVTD-72d9
---

Two configs on a new axis: they pay for the *shape* of your pipeline rather than for
what is in it. One rewards a packed pipeline, the other an empty one, so together they
pull a build in opposite directions and make "how much do I install" a live question
instead of "always install more".

The roster is over-full of unconditional coverage multipliers, so a pair keyed to
occupancy is worth having. Both need a decision first (below) — neither can be built
exactly as described.

## Config 1: Memory Pressure

**As asked:** while storage capacity is over 75%, gain 1.3x coverage.

**Blocked as written.** There is no storage capacity. ADR-045 Decision 1 deleted the KB
cap outright: `STORAGE_CAP_KB`, every `capKb`, the clamp at Climb on. KB is a balance
with no ceiling, so "over 75% of capacity" has no denominator. The same ADR also rules
out reintroducing one for a card: "Raising a rarely-hit ceiling is also explicitly not a
config: a card that lifts a limit you seldom reach is dead for most of the run."

**Recommended re-key: spot occupancy.** ADR-044 is titled "capacity is spots, money is
KB" — so the capacity the name is reaching for still exists, it is just the pipeline's
width. The config becomes:

> **Memory Pressure** - while your pipeline is over 75% full, all coverage earns x1.3.

That keeps the true name honest (memory pressure *is* an allocator running near its
limit), it is checkable on every poll, and it makes the pair below symmetrical.

- family `amplify`, rarity `crumb` (2 spots)
- `coverageMultiplier: 1.3`, gated on occupancy
- Holding it helps satisfy its own condition, which is fine: it pays for that in the
  currency it measures.
- Real tension with the gate peel: a miss frees spots and can drop you under the
  threshold exactly when you needed the multiplier most.

## Config 2: gain coverage per unused spot

**As asked:** gain 0.5% coverage for each unused slot. ("slot" -> **spot**; spots are
the live word for pipeline width, slots are the dead one.)

**Needs a cap — uncapped it is run-breaking.** `atMinimumWidth` is `configCount <= 1`,
so a one-config pipeline is legal, and the flat add sits inside the bracket that the
gate multiplier scales:

| where | spots | free | flat add | x gate | per answer | gate demands |
| --- | --- | --- | --- | --- | --- | --- |
| gate 0, holding only this | 4 | 3 | +1.5 | x1 | ~3% | 3 |
| gate 5, holding only this | 12 | 11 | +5.5 | x6 | ~39% | 85 |
| gate 11, holding only this | 24 | 23 | +11.5 | x12 | ~138% | 290 |

One correct answer clears gate 0. The dominant strategy is to buy nothing, which turns
off the shop — the loop the run is built around. For scale, Code Coverage is the
strongest flat add in the roster at a flat +0.5.

**Recommended: count at most 2 free spots (max +1.0).** That makes it strictly better
than Code Coverage only while you keep two spots empty, which costs you two configs —
a real trade, and it stops scaling with the ladder.

- name: **Headroom** (literal, real term, and the exact opposite of Memory Pressure)
- family `amplify`, rarity `bit` (1 spot — a bigger grade would eat its own payout)
- `coverageAdd: 0.5` per free spot, counted spots capped

## Decide before building

- [ ] Memory Pressure re-keyed from KB capacity to spot occupancy? (no other reading is
      buildable)
- [ ] Headroom's cap: 2 counted free spots, or another number/shape?

## Then

- [ ] `AnswerContext` learns the pipeline's occupancy — it is `{category, answeredBefore}`
      today, and `effectOf(config).coverage(context)` cannot see spots at all. Both
      configs need it, and it is the only structural change either one asks for.
- [ ] Roster entries + `gives`/`costs` lines
- [ ] Wiki: neither config changes a rule, so only the roster table needs the rows

## Unblocked by DVTD-811d

`Memory Pressure` as originally written is buildable again. ADR-046 brought the KB cap
back as a seven-rung storage plan, so "storage capacity over 75%" has a real
denominator: `storageCapFor(state.storagePlan)`. The recommended re-key to slot
occupancy is no longer forced — both readings now exist, and they are different configs.

## Model change 2026-09-12 (DVTD-nd6r)

The axis moved, and it moved somewhere better for this pair.

"While storage capacity is over 75%" has nothing to measure: ADR-074 makes
capacity soft, so there is no ceiling to be a percentage of. But the same
occupancy tension now lives in the upkeep bill, which every build carries and
can read off at any moment:

- **Memory Pressure** keys off a build whose weight costs real KB per gate.
- **Headroom** keys off a build inside the free weight (4, or whatever the
  storage plan raises it to).

That is a cleaner pair than the original. The old version keyed off a number the
player could raise by buying a bigger cap, which made the condition gameable
from outside the pipeline. Upkeep is the build's own weight, so the only way to
change it is to change what you installed, which is exactly the live decision
this pair was for.

The free-weight rung being purchasable does reintroduce a smaller version of the
same hole for Headroom, and that is worth pricing.
