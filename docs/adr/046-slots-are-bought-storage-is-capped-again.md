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

**Reladdered 2026-09-06 (playtest, DVTD-x5y1).** The doubling ladder was too steep to
climb and its top was not merely expensive but unbuyable. Every rung now steps a uniform
**×1.25** from a 32 KB floor, which is the price of the cheapest config on the shelf.

| slots 5–8 | 9–12 | 13–16 | 17–20 | 21–24 |
| --- | --- | --- | --- | --- |
| 32 · 40 · 48 · 64 | 80 · 96 · 120 · 160 | 192 · 240 · 288 · 384 | 480 · 576 · 704 · 896 | 1152 · 1408 · 1792 · 2304 |

Values are snapped to the 8 KB grid so the shop never quotes an arithmetic artefact,
which puts individual steps between ×1.2 and ×1.333 for a geometric mean of ×1.2524.

The old ladder ran 16 KB to 32768 KB. Its last four rungs cost more than the largest
storage plan holds (10240 KB), and `canBuySlot` tests the balance against the price while
`cappedStorage` clamps the balance to the cap — so those rungs could not be bought in a
run of **any** length. Calling them endless-run territory was wrong: an endless run cannot
hold the money either. Every rung on the new ladder is at or below the top cap, and
`rules.model.spec.ts` now asserts that as a law.

The whole ladder still costs more than a perfect twelve-gate climb earns (11056 KB against
2912 KB), so **24 slots is endless-run territory** and the brake ADR-045 got from the gate
schedule stays in the price. The margin is 3.8× where it used to be 46×, so the spec
asserts a floor of three perfect climbs rather than a bare inequality: the size of that
margin is now the design decision.

This reopens the width-buys-score-buys-width loop ADR-044 closed, deliberately. What
holds it is the escalating price plus the cap below, not a schedule.

Three brakes soften with the ratio, and all three are accepted rather than compensated for:

- **Cash-and-rebuy.** Decision 2's ratchet costs one rung, which was 100% and is now
  25–33%. Flexing width between gates is cheap. Still a strict loss, so no arbitrage.
- **The plan no longer gates the ladder's first half.** The free 256 KB cap bought 6 of 20
  rungs; it now buys 10 of 20, to 14 slots. Decision 3's "prerequisite for the ladder" is
  half true — the plan is still needed to hold a late gate's reward without burning it, but
  no longer to reach the middle of the ladder.
- **ADR-049's archive brake weakens, and its supporting figure is now wrong.** At the ×2
  start premium, opening at twelve slots costs 1280 KB rather than 3.1 MB, comfortably
  under what a perfect climb banks. Since archive accumulates across runs, a banked player
  can open near-wide every time. Whether `START_SLOT_PREMIUM = 2` is still right is
  reopened and deliberately not settled here.

The reladder also moves *toward* the coverage demands rather than away: as the consequences
below note, `COVERAGE_DEMANDS` was tuned when runs reached 24 slots, and a mid-teens run is
closer to that than 8 to 13 was.

## Decision 2: an empty slot cashes back at its own price, and the ladder never rolls back

Cashing an empty slot refunds **the price of the most expensive slot still held**. The
purchase index is a high-water mark, so the next slot bought always costs the rung
above the last one bought, whatever was cashed in between.

That closes the loop the obvious design leaves open. A flat refund lets a run buy the
fifth slot for 32 KB, cash it for more, and repeat. Refunding at position means
buy-at-32 cashes for exactly 32 — no profit — while a run holding nine slots can cash
one for 160 KB when it decides it will never fill them. Only empty slots can be cashed,
and never below the free four.

## Decision 3: the KB cap comes back as a seven-rung subscription

**Reladdered 2026-09-03 (playtest, DVTD-jrld).** The rungs below were spaced too
finely at the bottom and billed too little in the middle: on the old ladder the
first upgrade cost 16 KB a gate, which no clear ever noticed. The free cap drops
to 256 KB so it binds from the first shop, the caps double instead of creeping,
and every rung's bill is two to three times what it was. The bill is also now
**refused at the counter** when the balance cannot cover it (see the amendment
below).

| Cap | Per gate |
| --- | --- |
| 256 KB | free |
| 512 KB | 32 KB |
| 1 MB | 96 KB |
| 2 MB | 224 KB |
| 3 MB | 448 KB |
| 5 MB | 768 KB |
| 10 MB | 1280 KB |

ADR-045 deleted the cap because 320 KB held against a 1024 KB cap was never binding.
That was true **at those prices**. A slot now costs up to 768 KB and the free cap holds
256, so the plan is a prerequisite for the ladder: you cannot save for a mid-ladder
slot on the free plan. The cap binds on the first shop, which is what a cap has to do
to be a decision.

The bill lands **on clear only**, off the rewarded balance, ahead of the config
subscriptions — ADR-045's ordering survives, and a redo stays free of every recurring
cost. A clear that cannot cover the bill pays what it has and drops to the free plan,
and the balance is clamped to the free 256 KB cap. Dropping plans by hand burns the same way, and
the row says how much before it is picked.

The top two rungs bill more per gate than a perfect gate-12 clear pays. They are
endless-run rungs, like the top of the slot ladder, and the honest place to watch in
playtest is whether anything below 2.5 MB ever gets bought.

## Amendment (2026-09-03): a rung you cannot pay for is not for sale

A plan whose bill exceeds the balance was buyable, and the only thing that could
follow was insolvency one gate later: the plan gone, the overflow burned. That is
not a decision, it is a delayed refusal, so `canAffordPlan` now rejects an upgrade
to any rung billing more than the run holds. Dropping to a cheaper rung is always
allowed, since it is the escape. The shop's Continue is held shut while the plan
already held bills more than the balance, the same door the over-capacity build
shuts, with the fix named in the label: drop to a rung you can pay for.

The steeper ladder above changes what compounding needs. Moore's Law at L5 pays
10% a gate; on the 1 MB rung that only out-earns the 96 KB bill above roughly
640 KB held. Below that the balance decays instead of compounding, which is the
intended shape: the cap is a savings instrument you have to be able to afford.

## Amendment (2026-09-05): a rung opens by filling the cap below it

Which rungs the shop *shows* was never decided here, and the shop had quietly settled
it in Tier 2: `option.tier <= heldIndex + 1`, so renting a rung revealed the next one.
Buying the ladder was therefore the only way to see the ladder.

A rung is now revealed once a run has held the cap below it (`revealsPlanTier`), off a
KB high-water mark: `RunState.peakStorageKb`, taken once around the reducer, mirrored
onto `users.peak_storage_kb` whenever it rises. The free rung and 512 KB are always
shown, so a fresh account never opens the section on one card and six masks.

Storage is clamped at the cap being rented, so filling it is the run saying it has
outgrown the plan — the same moment a clear starts burning what will not fit. The
rung above is what that moment earns.

Reveal only, deliberately. Making a filled cap the *purchase* rule would be roughly 5×
the current bill-based requirement at every rung (1 MB would ask 512 KB held rather
than 96), and since the top two rungs already bill more than a perfect gate-12 clear
pays, requiring a filled 3 MB and 5 MB cap would close them for good. `canAffordPlan`
stays the only thing that decides what sells.

The mark is account-scoped: a rung opened in one run stays open in the next. In
ADR-050's vocabulary that is a **Reveal** — account scope, no balance impact — so it
takes that verb rather than a new one. A masked card carries its requirement as a
visible caption ("opens at 512 KB held · best 384 KB"), per ADR-051 decision 5: a mask
that only whispers on hover says nothing on touch.

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
