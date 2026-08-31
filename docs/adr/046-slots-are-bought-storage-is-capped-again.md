# ADR-046: Slots are bought, storage is capped again

## Status

Accepted (2026-08-30, Marciano, DVTD-811d).
**Supersedes [ADR-045](045-spots-come-from-gates-kb-rents-more-on-top.md)** — the
gate schedule and the extra-slot rent both go. Amends
[ADR-044](044-capacity-is-spots-money-is-kb.md) Decision 2 and
[ADR-030](030-gate-staged-storage-plans.md). Revives the *shape* of
[ADR-023](023-storage-capacity-is-a-subscription.md), a cap rented by the gate,
without the width it used to sell alongside. Numbers live in `SLOT_PRICES_KB` and
`STORAGE_PLANS` in `rules.model.ts`.

## Context

Width was not a decision. Gates handed slots over on a fixed schedule and the shop
rented four more, so every run reached the same width at the same depth and the only
choice left was a radio worth 8 KB a gate. The largest number on the board was one the
player never chose.

## Decision 1: every slot above the free four is bought outright

A run opens on **4 slots** and buys the rest, one press at a time, up to **24**. There
is no schedule and no rent: the price is the whole cost, paid once.

| slots 5–8 | 9–10 | 11–12 | 13–14 | 15–16 | … |
| --- | --- | --- | --- | --- | --- |
| 16 · 32 · 64 · 128 | 192 · 256 | 384 · 512 | 768 · 1024 | 1536 · 2048 | doubling every second rung |

The opening four rungs double every rung, which makes the fifth to eighth slot quick to
reach. After 128 KB the pace halves to a doubling every *second* rung, so the ladder
climbs without becoming unreadable.

The whole ladder costs more than a perfect twelve-gate climb earns, so **24 slots is
endless-run territory**. A normal run reaches 8 to 13 and spends the difference on
configs. That is the brake ADR-045 got from the gate schedule, moved into the price.

This reopens the width-buys-score-buys-width loop ADR-044 closed, deliberately. What
holds it is the escalating price plus the cap below, not a schedule.

## Decision 2: an empty slot cashes back at its own price, and the ladder never rolls back

Cashing an empty slot refunds **the price of the most expensive slot still held**. The
purchase index is a high-water mark, so the next slot bought always costs the rung
above the last one bought, whatever was cashed in between.

That closes the loop the obvious design leaves open. A flat refund lets a run buy the
fifth slot for 16 KB, cash it for more, and repeat. Refunding at position means
buy-at-16 cashes for exactly 16 — no profit — while a run holding nine slots can cash
one for 768 KB when it decides it will never fill them. Only empty slots can be cashed,
and never below the free four.

## Decision 3: the KB cap comes back as a seven-rung subscription

| Cap | Per gate |
| --- | --- |
| 512 KB | free |
| 768 KB | 16 KB |
| 1 MB | 32 KB |
| 1.5 MB | 64 KB |
| 2.5 MB | 128 KB |
| 5 MB | 384 KB |
| 10 MB | 768 KB |

ADR-045 deleted the cap because 320 KB held against a 1024 KB cap was never binding.
That was true **at those prices**. A slot now costs up to 768 KB and the free cap holds
512, so the plan is a prerequisite for the ladder: you cannot save for a mid-ladder
slot on the free plan. The cap binds on the first shop, which is what a cap has to do
to be a decision.

The bill lands **on clear only**, off the rewarded balance, ahead of the config
subscriptions — ADR-045's ordering survives, and a redo stays free of every recurring
cost. A clear that cannot cover the bill pays what it has and drops to the free plan,
and the balance is clamped to 512 KB. Dropping plans by hand burns the same way, and
the row says how much before it is picked.

The top two rungs bill more per gate than a perfect gate-12 clear pays. They are
endless-run rungs, like the top of the slot ladder, and the honest place to watch in
playtest is whether anything below 2.5 MB ever gets bought.

## Consequences

Deleted: `SPOT_RUNGS`, `scheduledRung`, `scheduledSpots`, `spotLadderTo`,
`EXTRA_SPOT_TIERS`, `EXTRA_SPOT_RENT_KB`, `extraRentKb`, `extraSlotsUnlocked`,
`spotsHeldWith`, `FREE_SPOTS_CEILING`, `RunState.extraSlots`, `slotRentKb`,
`rentDefaulted`, `recapacitied`, and the gate dex's `rung` unlock kind. `MAX_SPOTS` is
24 again rather than 28.

Added: `SLOT_PRICES_KB`, `nextSlotPriceKb`, `slotCashOutKb`, `STORAGE_PLANS`,
`storageCapFor`, `planBillKb`, `cappedStorage`, `RunState.slotsBought`, `storagePlan`,
`planBilledKb`, `planDowngraded`. `addStorage` takes the plan tier and clamps, so no
credit anywhere can pass the cap. The `set-extra-slots` action becomes `buy-slot`,
`cash-slot` and `set-storage-plan`. The shop grows two sections where it had one:
**Slots** carries the two presses, **Storage plan** carries the radio.

`isOverCapacity` can no longer fire in a live run — nothing narrows a build now that
the rent default is gone. The guard stays as an invariant because peel and strip still
resize builds, and the shop's exit lock keeps its copy, changed from "rent more room"
to "buy a slot".

A git-tag rescue starts on the free four rather than the width its depth used to owe.
Its 32 KB-per-gate stipend buys four slots at gate 10, which is close to what it lost,
but it is a real nerf and worth watching.

One thing to watch in playtest. `COVERAGE_DEMANDS` was tuned when every run reached 24
slots by gate 10. A run now realistically holds 8 to 13, so gates 9 to 12 may be
unclearable. It is deliberately not pre-tuned: the measured result is that width
self-cancels and aim is what swings the win rate, so the demands may already be right.
