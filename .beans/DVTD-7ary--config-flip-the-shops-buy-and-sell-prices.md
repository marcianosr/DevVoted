---
# DVTD-7ary
title: 'Config: flip the shop''s buy and sell prices'
status: draft
type: task
priority: normal
created_at: 2026-08-29T14:59:10Z
updated_at: 2026-08-29T14:59:10Z
parent: DVTD-72d9
---

A config that swaps the two numbers on every shop row: you draft at the refund price and sell back at the draft price. Common configs go in at 16KB and come out at 32KB.

## The loop this opens, and it has to be closed first

`sellRefundIn` refunds half of what the build actually paid, and the comment on it already names the reason: under Freemium's half-price shelf, a list-priced refund would equal the discounted draft, "making churn free and build commitment meaningless". Flipping the prices does exactly that and then some. A sold config is no longer owned, so `offerRefusal` lets it be re-drafted from the same shelf: buy 16, sell 32, repeat, unbounded KB inside one shop visit.

Four ways to bound it:

1. **Sell side only.** Refunds pay the full draft cost; buys are unchanged. No loop at all (in 32, out 32). Sells risk-free experimentation and turns the shop into a lending library.
2. **Both sides, one flip per config id per run.** Bounded by the roster, but it needs a traded-set field and the rule is invisible until you hit it.
3. **Both sides, and a sale takes the config off this visit's shelf.** Closes the loop with one readable sentence, and the fiction is clean: you sold it, it is gone.
4. **Both sides plus a recurring bill** (Freemium's `subscriptionKb`). Taxes the arbitrage instead of blocking it, and stacks two economies on one slot.

**My pick: 3.** It is the most faithful reading of "flip the values" and it needs one rule, not a new counter.

## Stacking rules it has to state

- **WTFPL** zeroes every refund while installed. Two configs pointing opposite ways at the same field. The legendary's absolute clause should win, and the flip's row should say so rather than silently paying nothing.
- **Freemium** already halves draft costs. Composed naively, buys land at a quarter of list while sells pay full, which reopens the loop through *other* configs even under rule 3. The flip should **replace** the price (buy price = the base refund) rather than multiply with `draftDiscountIn`.
- Both hooks already exist and are build-aware: `draftCostIn` and `sellRefundIn` in `shop/domain/draft.model.ts`. Every surface that quotes a price reads them, so the change lands in one place.

## Name

Two names for two shapes, and the shape decides:

- Both sides flip: **NFT**. Flipping is the word that scene actually uses, and selling something back for more than it is worth is the joke telling itself. Runner-up: **Bull Market**.
- Sell side only: **Warranty**. It answers WTFPL's "no warranty" clause directly, in vocabulary the roster already uses, and full money back is what a warranty means.

## Numbers

Legendary, 256KB, economy. It is strictly stronger than Freemium's half-price shelf (that one only discounts the way in; this pays full on the way out too), and it touches every transaction for the rest of the run. If playtesting says legendary is too rich for a config with no coverage, the Freemium shape is the fallback: free to install, with a bill that grows per gate.

## Todos

- [ ] Pick the shape (1 to 4) and therefore the name
- [ ] Write the stacking rules for WTFPL and Freemium into the roster comment, not just the spec
- [ ] `draftCostIn` / `sellRefundIn` read the flip; a spec pins that buy-then-sell nets zero or less in every combination, including with Freemium installed
- [ ] Shop rows quote the flipped figures everywhere (offer price, sell button, refusal copy)
- [ ] Roster entry, wiki roster row + the shop section, CHANGELOG
