---
# DVTD-s04t
title: Freemium's doubling makes it unpayable from about gate 8
status: todo
type: bug
priority: normal
created_at: 2026-09-10T17:40:01Z
updated_at: 2026-09-12T12:56:27Z
---

`subscriptionBillFor` doubles Freemium's bill every gate: 8 KB at the first clear, 128 KB at gate 4, 2048 KB at gate 8, and **32768 KB (32 MB) at gate 12**. A perfect gate-12 clear pays a few hundred KB and the top storage plan caps at 10 MB, so from roughly gate 8 the config cannot be paid for by any run, and `billSubscriptionsOnClear` lapses it.

Surfaced while building the kanto prep screen (DVTD-g8k8): mock #415 draws Freemium in a gate-12 build with a −128 KB bill, which is really its **gate-4** figure. The kanto Champion story now shows the engine's own number and the shortfall warning beside it, so the screen is honest, but the economy behind it is worth a look.

Options, none chosen:
- Cap the growth (a ceiling rung, the way GATE_REWARD_MULTIPLIER_CAP caps the clear payout).
- Make it grow linearly rather than doubling.
- Leave it and treat lapsing as the intended arc — in which case the config's copy should say it is a rental for the early gates, not a keeper.

## Notes

- `subscriptionKb: 8`, `subscriptionGrowthPerGate: 2` in configRoster.model.ts; the arithmetic is `subscriptionBillFor` in subscription.model.ts.
- Freemium is the roster's only subscription, so this is the whole subscription axis.

## Model change 2026-09-12 (DVTD-nd6r)

Freemium is a config subscription (`subscriptionBillFor`), not the storage plan,
so the bug survives ADR-074. Two things in the reasoning above do not:

- "the top storage plan caps at 10 MB" is gone. Nothing caps a balance now, so
  the argument for why the doubling is unpayable rests on income alone. It still
  holds: a perfect gate-12 clear pays a few hundred KB against a 32 MB bill.
- Every build now also pays a weight upkeep bill at every gate close (ADR-074
  decision 1). A doubling config bill and a recurring build bill compete for the
  same balance, so the gate at which Freemium becomes unpayable moves earlier,
  not later.

New question for the options list: ADR-074 decision 4 peels the build when its
upkeep is unaffordable. Decide whether an unpayable config subscription still
lapses quietly or joins that peel, because two insolvency rules with different
outcomes is the kind of thing that reads as a bug.
