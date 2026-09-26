---
# DVTD-ib77
title: 'Spots for sale in the deal: a rolled spot offer in the shop and at the start'
status: scrapped
type: feature
priority: normal
created_at: 2026-08-29T18:57:36Z
updated_at: 2026-08-30T08:40:35Z
---

A spot that shows up in the deal itself, rolled like a config, buyable next to them. Asked for on both surfaces: the shop's offer list and the start screen's deal.

Note on words: this is **spots**, not slots (ADR-044 renamed capacity on 2026-08-28, and DVTD-t7yk already moved Start and Prep over).

## It reopens ADR-045 Decision 4, and it dodges the reason that one was pulled

Buying an extra spot outright was built and removed the same day (DVTD-lxla, parked as DVTD-owun). The stated reason was not that owning a spot is wrong: it was that the buy-out added "a second price, a second press and a second piece of state to a section whose whole point is one choice". The rent ladder is a radio group, and the buy-out put a second control inside it.

Rolling the spot into the deal answers exactly that objection. It is not a second press in the rent section; it is a row in the shelf, priced like everything else there, competing with the configs beside it. What does not go away is the state: a bought spot must be a separate number from the rented step, or the rent bills a spot you own and the default rule takes it back.

ADR-045 also names what the purchase is really buying, and it is worth keeping in the copy: ownership is immunity from the rent default, which is "the half of the price KB cannot express".

## The ceiling question, which decides everything else

ADR-045 Decision 2 fixes the free width to a schedule so a rich run is never wider than a poor one (the width-buys-score-buys-width loop ADR-044 closed). A bought spot is KB turning into width, so where it lands matters:

- **A. Inside the existing ladder.** Buying converts one of the four extra-spot steps from rented to owned. Same ceiling as today (4 extra), no new maximum, and the decision is purely "pay once instead of every gate". This is the shape the removed buy-out had, moved to the shelf. **My pick.**
- **B. On top of the ladder.** A bought spot stacks above the four rented ones, capped at one or two and gate-staged. This is the treasure-moment version, and it does reopen the loop, deliberately and in small print. Only defensible if the cap is tight and the roll is rare.

## Price

The removed buy-out was priced at ten gates of the step's rent, so 80 KB for the first step. That anchor is Marciano's own and worth keeping: it is expensive early and obviously correct late, which is the shape a one-off purchase should have against a subscription.

## The start screen has no money

`createRun` opens a normal run on 0 KB (the stipend is only for a git-tag rescue), so there is nothing to buy with at the start. Three answers, and they are different features:

- **Pay in offers, not KB.** The spot is one of the dealt rows: take it instead of a config. The price is the config you did not take, which needs no economy at all and no server call. Fits "occurs randomly next to configs" exactly. **My pick for this surface.**
- **Pay from the archive.** The Start screen's Rebuild tooltip already says "paid from your archive, not from this run's storage", and a guarded atomic debit exists in `src/domains/economy/api/archive.queries.ts`. This makes it a cross-run economy decision and a server action rather than a reducer action, which is a much bigger change than the shop half.
- **Open the run with a stipend** so there is something to spend. Rejected on sight: it reprices the whole opening.

## Rolling it

- Seed it off `draftSeed(gatesCleared, rebuildsUsed, extensionsBought)` like the shelf, so two players at the same gate still see the same deal. An unseeded roll breaks the shared-shelf promise the daily seed exists to keep.
- It should consume one of the offer rows rather than appear as an extra one. That is what makes it a decision, it keeps the shelf a fixed size, and it makes Rebuild a real gamble.
- Frequency is a tuning number, and the honest starting point is rare enough that a run cannot plan around it: if the spot shows up every shop, it is just the rent ladder with extra steps.

## What it touches

- State: a bought-spots number beside `extraSpots`, added in `spotsHeldWith`, excluded from `extraRentKb` and from the give-back on a rent default.
- `rollDraft` learns to yield a non-config row, or the shop state carries a rolled `spotOffer` the shelf renders in line. The lighter second option avoids widening the offer type through every surface, and the storage-plan section is precedent for the shop selling things that are not configs.
- `isOverCapacity` and the shop's exit lock (DVTD-i388) both read width; neither may treat an owned spot as revocable.
- ADR-045 Decision 4 needs an amendment recording the reversal and why the shelf framing survives the objection the buy-out did not.

## Todos

- [ ] Decide A or B (inside the ladder, or above it)
- [ ] Decide the start-screen currency: an offer row taken instead of a config, or archive KB
- [ ] Set the roll frequency and confirm the seed keeps shelves identical across players
- [ ] Amend ADR-045 Decision 4 with the outcome, and unpark or close DVTD-owun
- [ ] Wiki section on spots, CHANGELOG

## Reasons for Scrapping

Superseded by DVTD-811d / ADR-046. The extra-slot rent ladder this bean argued about
no longer exists: slots are bought outright on a rising price ladder, which is what
both this bean and DVTD-ib77 were reaching for. The ceiling question it turned on
("inside the ladder or on top of it") is moot — there is one ladder now.
