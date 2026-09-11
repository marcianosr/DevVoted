---
# DVTD-s04t
title: Freemium's doubling makes it unpayable from about gate 8
status: todo
type: bug
priority: normal
created_at: 2026-09-10T17:40:01Z
updated_at: 2026-09-10T17:40:01Z
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
