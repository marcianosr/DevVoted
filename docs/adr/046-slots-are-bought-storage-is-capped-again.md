# ADR-046: Slots are bought, storage is capped again

## Status

Accepted 2026-08-30 (Marciano, DVTD-811d), reladdered twice on playtest
(2026-09-03 DVTD-jrld, 2026-09-06 DVTD-x5y1) and amended twice (2026-09-03,
2026-09-05).

**Superseded 2026-09-12 (DVTD-nd6r) in all three decisions** by
[ADR-074](074-weight-is-what-the-build-costs-to-run.md): capacity is soft, so
there is no slot to buy and no cap to rent, and the storage plan sells free
build weight instead of held KB. **The code is still this ADR's**, which is why
the file is here and not in the Retired table: `SLOT_PRICES_KB` and
`STORAGE_PLANS` in `rules.model.ts` run the shop, the gate and
`run.validation.ts`. Read it to understand what is running; read 074 for what is
decided. It retires when the code does.

Supersedes ADR-045 (retired; its reasoning is in
[rejected.md](rejected.md)) and amends
[ADR-044](044-capacity-is-spots-money-is-kb.md) Decision 2. Revives the *shape*
of the old storage subscription, a cap rented by the gate, without the width it
used to sell alongside. Numbers live in `SLOT_PRICES_KB` and `STORAGE_PLANS` in
`rules.model.ts`.

## Context

Width was not a decision. Gates handed slots over on a fixed schedule and the
shop rented four more, so every run reached the same width at the same depth and
the only choice left was a radio worth 8 KB a gate. The largest number on the
board was one the player never chose.

## Decision 1: every slot above the free four is bought outright

A run opens on **4 slots** and buys the rest, one press at a time, up to **24**.
There is no schedule and no rent: the price is the whole cost, paid once.

**The ladder is a uniform ×1.25 from a 32 KB floor**, which is the price of the
cheapest config on the shelf. Values snap to the 8 KB grid so the shop never
quotes an arithmetic artefact, which puts individual steps between ×1.2 and
×1.333.

The original doubling ladder ran 16 KB to 32768 KB, and its last four rungs cost
more than the largest storage plan can hold. Since affordability is tested
against the balance while the balance is clamped to the cap, those rungs could
not be bought in a run of **any** length. Calling them endless-run territory was
wrong: an endless run cannot hold the money either. Every rung on the new ladder
is at or below the top cap, and `rules.model.spec.ts` asserts that as a law.

The whole ladder still costs more than a perfect twelve-gate climb earns, so 24
slots stays endless-run territory and the brake ADR-045 got from a schedule now
lives in the price. The margin is 3.8× where it used to be 46×, so the spec
asserts a floor of three perfect climbs rather than a bare inequality: **the size
of that margin is now the design decision.**

This reopens the width-buys-score-buys-width loop ADR-044 closed, deliberately.
What holds it is the escalating price plus the cap below, not a schedule. Three
brakes soften with the ratio, and all three are accepted rather than compensated
for:

- **Cash-and-rebuy.** Decision 2's ratchet costs one rung, which was 100% and is
  now 25–33%, so flexing width between gates is cheap. Still a strict loss, so no
  arbitrage.
- **The plan no longer gates the ladder's first half.** The free cap bought 6 of
  20 rungs and now buys 10. Decision 3's "prerequisite for the ladder" is half
  true: the plan is still needed to hold a late gate's reward without burning it,
  but no longer to reach the middle of the ladder.
- **ADR-049's archive brake weakens.** At the current start premium, opening at
  twelve slots costs well under what a perfect climb banks, and archive
  accumulates across runs, so a banked player can open near-wide every time.
  Whether `START_SLOT_PREMIUM` is still right is reopened and deliberately not
  settled here.

## Decision 2: an empty slot cashes back at its own price, and the ladder never rolls back

Cashing an empty slot refunds **the price of the most expensive slot still
held**. The purchase index is a high-water mark, so the next slot bought always
costs the rung above the last one bought, whatever was cashed in between.

That closes the loop the obvious design leaves open: a flat refund lets a run buy
the cheapest slot, cash it for more, and repeat. Refunding at position means
buy-at-32 cashes for exactly 32, no profit, while a run holding nine slots can
cash one for a late-rung price when it decides it will never fill them.

Only empty slots can be cashed, and never below the free four.

## Decision 3: the KB cap comes back as a seven-rung subscription

Seven rungs from a free floor to 10 MB, each with a per-gate bill, in
`STORAGE_PLANS`.

**Reladdered because the first shape did nothing.** The rungs were spaced too
finely at the bottom and billed too little in the middle: the first upgrade cost
16 KB a gate, which no clear ever noticed. The free cap dropped so it binds from
the first shop, the caps double instead of creeping, and every rung's bill is two
to three times what it was.

ADR-045 deleted the cap because a mid-run balance held far under it. That was
true **at those prices**. A slot now costs up to 768 KB against a 256 KB free
cap, so the plan is a prerequisite for the ladder: you cannot save for a
mid-ladder slot on the free plan. The cap binds on the first shop, which is what
a cap has to do to be a decision.

The bill lands **on clear only**, off the rewarded balance, ahead of the config
subscriptions, so a redo stays free of every recurring cost. A clear that cannot
cover the bill pays what it has and drops to the free plan, with the balance
clamped to the free cap. Dropping plans by hand burns the same way, and the row
says how much before it is picked.

The top two rungs bill more per gate than a perfect gate-12 clear pays. They are
endless-run rungs, like the top of the slot ladder.

### A rung you cannot pay for is not for sale (2026-09-03)

A plan whose bill exceeds the balance was buyable, and the only thing that could
follow was insolvency one gate later: the plan gone, the overflow burned. That is
not a decision, it is a **delayed refusal**, so `canAffordPlan` rejects an
upgrade to any rung billing more than the run holds. Dropping to a cheaper rung
is always allowed, since it is the escape. The shop's Continue is held shut while
the plan already held bills more than the balance — the same door the
over-capacity build shuts — with the fix named in the label.

Compounding needs this: Moore's Law at L5 pays 10% a gate, which only out-earns
the 1 MB rung's bill above roughly 640 KB held. Below that the balance decays
instead of compounding, which is the intended shape. **The cap is a savings
instrument you have to be able to afford.**

### A rung opens by filling the cap below it (2026-09-05)

Which rungs the shop *shows* was never decided here, and Tier 2 had quietly
settled it as "one past what you hold", so buying the ladder was the only way to
see the ladder.

A rung is revealed once a run has held the cap below it (`revealsPlanTier`), off
a KB high-water mark: `RunState.peakStorageKb`, mirrored onto
`users.peak_storage_kb` whenever it rises. The free rung and the one above are
always shown, so a fresh account never opens the section on one card and six
masks.

Storage is clamped at the cap being rented, so filling it is the run saying it
has outgrown the plan, the same moment a clear starts burning what will not fit.
The rung above is what that moment earns.

**Reveal only, deliberately.** Making a filled cap the *purchase* rule would be
roughly 5× the bill-based requirement at every rung, and since the top two rungs
already bill more than a perfect clear pays, it would close them for good;
`canAffordPlan` stays the only thing that decides what sells. The mark is
account-scoped, so a rung opened in one run stays open in the next, which makes
it a **Reveal** in ADR-050's vocabulary rather than a new verb. A masked card
carries its requirement as a visible caption, per ADR-051 Decision 5: a mask that
only whispers on hover says nothing on touch.

## Consequences

- The shop grows two sections where it had one: **Slots** carries the two
  presses, **Storage plan** carries the radio. `addStorage` takes the plan tier
  and clamps, so no credit anywhere can pass the cap.
- `isOverCapacity` can no longer fire in a live run, since nothing narrows a
  build now the rent default is gone. It stays as an invariant because peel and
  strip still resize builds, and the shop's exit lock keeps its copy.
- A git-tag rescue starts on the free four rather than the width its depth used
  to owe. Its stipend buys back roughly what it lost, but it is a real nerf.
- **Watch in playtest:** the demand table this warned about was tuned when every
  run reached 24 slots by gate 10, and a run now realistically holds 8 to 13.
  `HEALTHY_LADDER` replaced it ([ADR-073](073-coverage-is-a-flat-gain-reset-every-gate.md)),
  so gates 9 to 12 are worth rewatching against the new line. The measured result
  still stands: width self-cancels and **aim** is what swings the win rate.
- The honest thing to watch on the plan is whether anything below the middle
  rungs ever gets bought.
