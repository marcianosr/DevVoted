---
# DVTD-6hqm
title: Every shop price previews the balance it leaves
status: completed
type: feature
priority: normal
created_at: 2026-09-29T13:58:00Z
updated_at: 2026-09-29T14:09:44Z
---

**What:** Hovering or focusing any config price in the shop names the balance that press would leave, selling included.

**Why:** A refund says what it pays but not what you end up holding, which is the number the decision turns on.

## Done when
- [x] Install, upgrade and uninstall each preview the balance they leave
- [x] A refund reads as a gain and a spend as a loss, without confusing the two
- [x] The preview names the price under the pointer, not the card it sits on
- [x] The refund quoted on a build card is the refund the run actually pays
- [x] Every price on the build panel is reachable, the upgrade press included

## Notes

The install half already exists: the registry card's hover sets `pointedId` in
`ShopView.component.tsx`, feeding `afterInstallOf` in `shopScreen.viewmodel.ts`
into `Balance.preview` (ADR-124 decision 3).

Three gaps it leaves: selling and upgrading name no after-figure, the build
panel's chips cannot use the card hover at all because `Build.ui.tsx` overwrites
it with the weight-track highlight, and a card carrying two prices cannot say
which one a card-level hover means.

The trigger moves onto the press itself. `ConfigChip` gains one
`onQuote?: (quote?: ChipQuote) => void` naming which press is pointed; the
viewmodel owns the arithmetic and the copy.

Folds in the refund bug parked on DVTD-ea7h and named in ADR-123's consequences:
the card quotes `sellRefund` while the reducer pays `sellRefundIn`, so a build
holding the full-roster config promises 32 KB and pays nothing. A preview built
on that figure makes the lie load-bearing.

Plan: `~/.claude-work/plans/when-i-hover-over-giggly-clock.md`

## Summary of Changes

ADR-152, `docs/adr/152-every-price-previews-the-balance-it-leaves.md`.

**The press is the trigger.** `Button` takes `onHover` / `onLeave`, mapped to
mouseenter/leave and focus/blur on both its press and anchor arms. `ConfigChip`
takes one `onQuote?: (quote?: ChipQuote) => void` and each of its three presses
reports its own name, `undefined` on leave. The card's own `onHover` is
untouched, which is what left the build panel reachable — `Build` spends it on
the weight-track highlight and would otherwise have clobbered the preview.

**A pointed price is a signed delta.** `afterInstallOf` became `afterOf`:
`balance + deltaKb`, refused below zero, vermillion for a spend and viridian for
a refund. `shopHeaderFor` takes a `PointedPrice` rather than a price number, and
`ShopView` holds one `pointed` state instead of a `pointedId` plus an offer
lookup. `upgradeChipFor` now quotes too, which the registry never did.

**The refund quoted is the refund paid.** `buildChipFor` takes an options object
carrying the installed build and quotes `sellRefundIn`; `refundChipFor` and
`nextUpgradeCostOf` are new in `configChip.viewmodel`. A zero refund states no
figure at all, so the press reads a bare `Uninstall` rather than `+0 B`. Closes
this half of DVTD-ea7h and ADR-123's last open consequence.

Tests: 4 Button, 5 ConfigChip, 8 shop viewmodel, 2 ShopView. `PreviewingAnUninstall`
added to `Balance.stories`. No new ShopScreen story — the WTFPL case is a viewmodel
concern and the kit already draws an uninstall press without a refund.

Wiki §3 and §5.2 and CHANGELOG updated.
