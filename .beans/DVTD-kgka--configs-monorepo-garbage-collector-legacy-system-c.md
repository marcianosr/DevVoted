---
# DVTD-kgka
title: 'Configs: Monorepo, Garbage Collector, Legacy System, Cloud Provider'
status: draft
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-30T18:37:27Z
updated_at: 2026-09-06T09:57:04Z
parent: DVTD-72d9
---

Four configs, all on the economy/storage side of the roster rather than the coverage
side. Each is written up with what it needs decided before it can be built; where a
number is missing I have proposed one rather than left it blank, so the whole set can
be accepted or argued with in one pass.

Sibling story: DVTD-815w (Memory Pressure / Headroom).

## Config 1: Monorepo

**As asked:** all category configs get a 10% bonus. Must have at least 3 equipped.

The condition is right — it prices the config in build shape, not KB, and "hold 3
category configs" is a decision you make in the shop and can see on the track.

**The payout is close to nothing.** Only the config matching the poll's category fires;
the other two sit at `skipped · js only`. So a 10% bonus on "all category configs"
is, per answer, a 10% bonus on *at most one* of them. With 10 categories in
`CATEGORY_METADATA` and 3 held, a poll matches roughly 30% of the time:

| held | chance a poll matches | value per answer |
| --- | --- | --- |
| 3 categories | ~30% | ~+3% coverage |
| 5 categories | ~50% | ~+5% coverage |

Three slots of category configs to average +3% is a bad trade against, say, Code
Coverage's flat +0.5 for two slots.

**Two ways out — pick one:**

1. **Raise the number.** ×1.1 becomes ×1.5 on the matching category config. Same shape,
   the arithmetic just works: ~+15% per answer for a 3-category build.
2. **Change the shape to fit the name** (recommended). A monorepo is *every package in
   one place*, so: **every category config you hold fires on every poll, whatever its
   category.** Three ×1.25s stack to ×1.95 on every answer, and the config stops being
   a rounding error the moment you go wide. It reads true, it makes "go wide on
   categories" an actual archetype, and it needs no new number.

Option 2 is a genuinely strong effect, so it wants a real grade — `nibble` (4 slots) at
least, on top of the 3 slots its condition already costs.

- family `amplify`, condition: 3+ configs with a `focusCategory`

## Config 2: Garbage Collector

**As asked:** every 3 correct, refund part of the KB spent in the previous gate.

Three things are unspecified and one is unbuildable today.

**Nothing tracks spend.** There is no `spentKb`, no per-gate spend anywhere in
`RunState`. The refund needs a new tracked figure, which is the config's real cost to
build.

**"Previous gate" makes it dead on arrival and unreadable after.** It pays nothing in
gate 0, and from gate 1 it pays against a number the player was never shown — you
cannot value it in the shop, which is where you decide to buy it.

**Recommended:** refund against **this gate's** spend, which is on screen the whole
time, and state the fraction:

> **Garbage Collector** — every 3rd correct answer refunds 25% of what you have spent
> this gate.

That still reads as a collector reclaiming what you allocated, it pays from gate 0, and
"spent this gate" is a figure the shop can show on the config's own row. Counter runs
across the gate and resets at the clear, matching how the window already works.

- family `economy`, rarity `crumb`
- needs: `spentThisGateKb` on `RunState`, incremented wherever KB leaves the balance

## Config 3: Legacy System

**As asked:** ×3 storage reward, diminishing each gate until -×2. Cannot uninstall
unless you lose a gate.

The best of the four, and the only one that is a real Faustian bargain rather than a
rate. I read "until -×2" as the multiplier going *negative* — it starts as a windfall
and ends as a drain — because that is what a legacy system does and because a floor at
+×2 would make it a strictly-good card with a lock on it.

**Decay schedule (proposed):** −0.5 a gate from ×3, so it turns on you after five gates
and bottoms out at −×2 after ten. Enough runway that the bargain is real, slow enough
that you can plan the exit.

| gates held | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10+ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| clear pays | ×3 | ×2.5 | ×2 | ×1.5 | ×1 | ×0.5 | ×0 | −×1 | −×2 |

**Open, and it needs an answer before this can ship:** a negative multiplier on a gate
clear means clearing a gate *costs* you KB. Storage has no floor rule for that today.
Either it clamps at 0 (safe, and the drain quietly stops mattering), or it can take you
below 0 and the run ends — which is a far better ending than a slow fade, and matches
"you cannot uninstall it".

**The lock:** uninstall blocked, and **sell blocked too** (otherwise selling is the
uninstall). The gate peel can still take it — that is the escape hatch, and it costs
you the gate, which is the point.

- family `risk`, rarity `nibble`
- needs: gates-held counter per config, a negative-storage rule, an uninstall/sell lock

## Config 4: Cloud Provider

**As asked:** ×2 storage on gate clear, but subscriptions cost double.

**The drawback is inert.** The roster has exactly **one** config with a
`subscriptionKb` — Freemium, a `byte` at 1-in-33. Hold anything else and Cloud Provider
is a flat ×2 with no downside at all, which is not a trade, it is a windfall.

**Also ambiguous:** what does ×2 multiply? There is one config with `storageOnClear`
(Unit Tests), so if it means *that*, Cloud Provider does nothing unless you also drew
one specific card — a dependency, not a synergy. It should multiply
`gateRewardPaidKb`, the KB every clear pays, so it works in every build.

**Recommended fix — bill it against slot rent instead:**

> **Cloud Provider** — gate clears pay ×2 storage. Your slot rent doubles.

Slot rent is a real recurring cost that scales with how wide you have gone, so the
trade bites exactly the builds that can afford the windfall, and it is not waiting on a
1-in-33 draw. Keep "subscriptions double" as well if you like — it just cannot be the
only drawback.

- family `economy`, rarity `crumb`

## Decide before building

- [ ] Monorepo: raise the number (option 1) or change the shape (option 2)?
- [ ] Garbage Collector: this gate's spend rather than the previous gate's?
- [ ] Legacy System: does the decay go negative, and does negative storage clamp at 0 or
      end the run?
- [ ] Cloud Provider: ×2 on the gate reward, and slot rent as the drawback?

## Then

- [ ] `RunState`: `spentThisGateKb`, and a per-config gates-held counter
- [ ] `Config`: fields for the four effects; uninstall/sell lock
- [ ] Roster entries with `gives`/`costs` lines
- [ ] Wiki: Legacy System's negative-storage rule is a new rule and needs a line; the
      other three are roster rows only
