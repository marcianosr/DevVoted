---
# DVTD-fcg9
title: 'Config: open-source makes drafts cheaper but locks selling'
status: draft
type: feature
priority: normal
created_at: 2026-09-16T18:23:28Z
updated_at: 2026-09-24T12:49:15Z
parent: DVTD-72d9
---

**What:** A config that discounts every later draft, at the price of never selling anything again this run.

**Why:** Both halves already exist on other configs, so the question is whether a third shop config earns a slot.

## Done when
- [ ] Decided: ship it, or re-cut the existing half-price config against it
- [ ] Decided: whether the discount stacks with the other one, and whether it blocks dropping too
- [ ] The discount size is set, and whether it covers upgrades
- [ ] Specs cover the discount and the sell refusal

## Notes

Future configs cost less to draft, but nothing can be sold again for the rest of
the run.

Drafted at `draft` status because it collides with two shipped configs and the
collision, not the implementation, is the open question.

## The collision

Both halves already exist, on separate configs:

- Freemium (8 slots, free to draft): draftCostFactor 0.5 halves every draft
  price while installed, and refunds drop to half of the discounted price. It
  pays for that with a doubling per-gate bill that lapses the config when the
  balance cannot cover it.
- WTFPL (8 slots, 512 KB): sellRefundIn returns 0 for everything while it is
  installed, its own sell included.

open-source = Freemium's discount + WTFPL's no-sell, minus Freemium's bill.

Mechanically it is trivial (draftCostFactor plus a sell refusal beside the
existing buildAtMinimumWidth and vendor-lock refusals in shopAction.sell). The
question is whether a third shop-economy config earns its slot.

## The case for building it anyway

It is arguably the CLEANER design of the three. Freemium's price is a bill you
pay in KB, which is the same currency the discount hands back - so it reads as a
loan, and the lapse rule exists to stop it being free money. open-source's price
is liquidity: you cannot unwind a bad buy, ever. That is a structural cost, not
an arithmetic one, and it cannot be papered over by a good run.

Which is also an argument that Freemium is the one that should be re-cut.

## Open questions

- Ship all three, or re-cut Freemium against this?
- Does the discount stack with Freemium's? draftDiscountIn is a product, so
      today it would: 0.25x drafts, which is almost certainly too far.
- Does the no-sell lock also block `drop`? drop refunds nothing, so blocking
      it would strand an over-wide build with no escape - probably not.
- Discount size, and whether it discounts upgrades too (upgradeStorageCost is
      untouched by draftDiscountIn today).

## Alternatives if it needs re-cutting

- The discount grows with how many configs you have never sold this run, so the
  no-sell is the engine rather than the tax.
- It discounts UPGRADES rather than drafts, which nothing currently touches and
  would put it on a different axis from Freemium entirely.
