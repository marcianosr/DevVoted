---
# DVTD-stiz
title: 'Config: Grandfathered (storage plan bills one rung lower)'
status: in-progress
type: task
priority: normal
created_at: 2026-08-26T19:25:04Z
updated_at: 2026-08-26T19:25:04Z
parent: DVTD-72d9
---

A config that reads your storage plan's bill one rung down the ladder (ADR-023/030). The cap you bought is unchanged; the price is the previous rung's price.

| Plan | Bill today | Billed with the config |
| --- | --- | --- |
| 512 KB (free) | free | free |
| 640 KB | 8 KB | free |
| 768 KB | 16 KB | 8 KB |
| 1 MB | 32 KB | 16 KB |
| 1.5 MB | 48 KB | 32 KB |
| 2 MB | 72 KB | 48 KB |
| 3 MB | 112 KB | 72 KB |

Marciano's ask said "768 is also free, 1024 is 8KB", which is two rungs on the live ladder: it reads as a ladder without the 640 rung. Built as one rung, matching the words ("upped one position"). The knob is `storagePlanBillTiersDown: 2` on the roster entry if playtesting wants his figures.

## Why it earns a slot

Two payouts, neither of them a faucet: the 640 rung becomes free (a permanent +128 KB of cap for no bill), and every deeper rung sheds 8 to 40 KB per gate. It pays nothing on the free plan, which is the condition that bounds it (no fee, per the standing rule that a config's price is its cost).

## Axis

New: every economy config so far adds income (Unit Tests on clear, IndexedDB per correct, Moore's Law interest) or cuts a one-off price (Freemium's draft discount). This one cuts a recurring cost. It also makes the plan's bill a build number rather than a constant, the same move `streakCapStepsFor` already made for the streak cap.

## Name

Grandfathered: the SaaS term for keeping the old, lower price when the vendor's tiers move. Literal, and it sits beside Freemium without overlapping it. Runners-up: Reserved Instance (implies prepay), Student Discount, Legacy Pricing.

## Numbers

Uncommon, 64 KB, economy family, not upgradable. Break-even is 4 gates at the 1 MB rung, 2 gates at 3 MB, and never on the free plan. Weaker than Unit Tests (common, +32 KB a clear) below the 2 MB rung, which is deliberate: the strategic half is that it makes a deep rung affordable a gate or two earlier than the economy otherwise allows.

## Todos

- [ ] `storagePlanBillTiersDown` on `Config`, through `Effect`/`effectOf`, aggregated by a `planBillTiersDownFor(configs)` in `pipeline.model.ts`
- [ ] `storagePlanBillKb(plan, tiersDown)` in `rules.model.ts`: pure ladder arithmetic, floors at the free rung
- [ ] `chargeStorageBill` (`answer.model.ts`) charges the discounted bill, and insolvency is judged against it
- [ ] View: `billKb`, `storageBillKb`, `billLedger`'s plan line and every `storagePlans[]` rung quote the discounted price, or the shop sells a rung at a price it will not charge
- [ ] `changePlan`'s log line quotes the discounted bill
- [ ] Roster entry + specs (ladder floor, discounted charge, insolvency at the discounted bill, ledger line)
- [ ] Docs: wiki roster table + 5.1 plan table note, ADR-023 marker (bills are no longer fixed), CHANGELOG
