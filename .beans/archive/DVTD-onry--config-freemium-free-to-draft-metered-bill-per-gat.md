---
# DVTD-onry
title: 'Config: Freemium (free to draft, metered bill per gate)'
status: completed
type: feature
priority: normal
created_at: 2026-08-20T14:51:08Z
updated_at: 2026-08-20T15:01:43Z
---

The first config priced as a subscription instead of a purchase. Free to draft; every gate you clear with it installed bills you, doubling with the run's depth (8/16/32/64/128/256KB from gate 0). Benefit: every config drafts at half price while it is installed. Cannot pay -> the plan lapses and the config uninstalls itself (non-lethal, mirrors ADR-023's downgrade).

## Design (2026-08-20, Marciano's spec + two redesigns)

Original spec: '4x... everyone else's shop items are 2x more expensive when buying; downside is it costs more to hold, increasing every gate.' The PvP half is split out to DVTD-mvhv. The hold-cost half is the whole config.

**Why a config and not the shop's Storage upgrades section** (he asked): (1) slot cost is the only opportunity cost that balances half-price drafting; storage plans have no slot cost, so it would be a strict upgrade to every build (the mandatory-config failure). (2) DVTD-xmu7 already built draftCostReduction/refundBoost as storage-shop items and was scrapped after live review 2026-08-09; its removal note records those effects were never even wired into draftCost/sellRefund. (3) The storage section sells cap; Freemium does not change cap, it drains balance. What IS borrowed is the storage plan's grammar: a KB/gate bill and a non-lethal lapse.

**Metered on gate depth, not tenure.** bill = subscriptionKb * growth ** gateCleared, read from the run's depth rather than how long you have held it. Kills the drop-and-redraft reset exploit with zero new state (re-drafting at gate 5 bills 256 immediately), and is thematically exact: usage-based pricing, the more you ship the more they charge.

**Bills on clears only**, following Deprecated's fuse rule (a failed attempt does not drain a config's life twice). Keeps the whole settlement in one path next to decayOnClear, so a lapse can never interact with the peel or with isStakeFatal, which would have made the pre-gate receipt's game-over line wrong.

**Refund honesty.** sellRefund is half of list, so half-price drafts would make churn free. While Freemium is installed, refunds compute on what you actually paid (a quarter of list) via the existing sellRefundIn aura. No refunds on discounted goods. WTFPL's 0 still wins.

Its own sell refund is 0, because a free plan has nothing to refund.

Todo:
- [x] Axes on Config: draftCostFactor, subscriptionKb, subscriptionGrowthPerGate
- [x] subscription.model.ts: bill fn + billSubscriptionsOnClear (identity-preserving, lapses on insolvency)
- [x] draftCostIn aura + sellRefundIn extension
- [x] Roster entry: economy, legendary, draftCost 0
- [x] Reducer: charge at closeWindow next to decay; lapsedConfigs + subscriptionBillKb announced on the reward screen (run log is not a surface)
- [x] Viewmodel + shop prices + factory defaults
- [x] Specs: bill ladder, lapse, discount, refund, no-reset-on-redraft
- [x] Wiki roster + CHANGELOG

## Summary of Changes

- `config.model.ts`: three axes — `draftCostFactor`, `subscriptionKb`, `subscriptionGrowthPerGate`.
- NEW `config/domain/subscription.model.ts`: `subscriptionBillFor(config, gate)` (8 * 2**gate), `subscriptionBillTotal`, `billSubscriptionsOnClear(configs, storage, gate)` returning `{configs, paidKb, lapsed}` — identity-preserving when the build carries no subscription, and settles in roster order against a running balance so one shortfall lapses one plan rather than all of them.
- `draft.model.ts`: `draftCostIn(configs, config)` (build-aware price, mirroring the `sellRefundIn` aura built for WTFPL) and `sellRefundIn` extended — WTFPL's 0 still wins, otherwise a discounted build refunds half of what it actually PAID.
- `configRoster.model.ts`: `freemium` — economy, legendary, `draftCost: 0`, `draftCostFactor: 0.5`, `subscriptionKb: 8`, `subscriptionGrowthPerGate: 2`.
- `run.model.ts`: RunState gains `lapsedConfigs` + `subscriptionBillKb`; billed inside `closeWindow` AFTER the reward is credited (a pre-reward charge would lapse a plan that the very clear had just paid for); `draft` charges `draftCostIn`; `finishReward` clears both fields.
- `runView.viewmodel.ts` + `RewardScreen.ui.tsx` + `RunReward.component.tsx`: offer prices and the refusal copy read the discount; a lapse gets its own announcement row (corner badge `lapsed`, "Bill unpaid — the plan lapsed and freed its slot") and the bill gets a deduction line beside the storage plan's.
- `proto-run.tsx`: wired the two new props AND the four the proto reward screen was already missing (`interestThisGateKb`, `extraPickThisGateKb`, `autoUpgraded`, `deletedConfigs`) — the same proto-invisibility class as the Prefetch bug.
- Stories: `RewardScreen/FreemiumLapsed`, `RewardScreen/SubscriptionsBilled`.

Verified: 1675 tests / 126 files, oxlint + dependency-cruiser (559 modules) + tsc all clean.

## Note on the reducer specs

The first draft of the reducer tests varied the GATE to reach a large bill, and all three deep-gate cases failed: `clearGate` answers 5/5, but a three-config build cannot meet a deep gate's coverage demand, so the window failed the gate and billing never ran at all. The reducer tests now stay at gate 0 and vary the plan's price instead (`unaffordablePlan`); the 8/16/32/64/128/256 ladder is asserted in `subscription.model.spec.ts`, where no gate is involved.

Not committed — awaiting review.
