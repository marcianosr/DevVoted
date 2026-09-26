---
# DVTD-0h4n
title: 'Storage overflow: shop-time clamp + slot-free cap-extension voucher'
status: scrapped
type: feature
priority: normal
created_at: 2026-08-06T09:45:39Z
updated_at: 2026-09-14T17:08:29Z
---

Design decision (2026-08-06): storage overflow above the 512 KB cap is
spend-it-or-lose-it, not silently discarded on arrival, and the cap-raising
"storage extender" is not a config.

## Why
- If cap extension took a pipeline slot, every build would run it and 100-config
  diversity would collapse into "extender + N free slots." It must be a
  Balatro-voucher-style shop purchase: slot-free, sticky (applies run-wide for
  the rest of the run), not installed into the pipeline.
- Clamping storage the instant a gate reward is paid punishes a rich gate
  silently. Instead: the reward can push storage past 512 KB, that overflow
  rides uncapped into the following shop visit, and the cap only clamps when
  the player presses Climb on. Use-it-or-lose-it turns overflow into a
  spending-spree moment instead of a quiet tax.
- The warning belongs wherever the remedy is. GateRewardReport.ui.tsx has no
  buttons, so it can only note the overflow happened. ShopScreen.ui.tsx /
  RunShop.component.tsx is where drafting/upgrading/rebuilding actually spends
  the overflow down, so the actionable warning belongs there.

## Todo
- [ ] Move the storage clamp (currently \`Math.min(current + income, STORAGE_CAP_KB)\`
      in run.model.ts, applied at gate-reward time) to the Climb-on transition
      instead, so overflow survives into the shop.
- [ ] GateRewardReport.ui.tsx: note when the reward pushed storage over the cap
      (informational, no CTA).
- [ ] ShopScreen.ui.tsx / RunShop.component.tsx: show the actionable overflow
      warning (how much is forfeit at Climb on) alongside the spending actions.
- [ ] Add "Extend cap" as a new shop action alongside Draft/Rebuild/Sell/Upgrade/
      Add a slot: a purchase that raises STORAGE_CAP_KB for the rest of the run,
      doesn't occupy a pipeline slot, isn't a config. Cost and cap increase TBD.
- [ ] Update specs covering the clamp-timing change (run.model.spec, gate reward
      flow).
- [ ] Wiki + CHANGELOG once implemented.

## Model change 2026-09-12 (DVTD-nd6r)

Both halves are moot. ADR-074 removes the storage cap, so there is no overflow
to clamp at shop time and nothing for a cap-extension voucher to extend.

The reasoning survives and is worth keeping where it can still be read: a
capacity raise must not take a pipeline slot, or every build runs it and the
roster collapses. That argument now applies to the storage plan's free-weight
rungs, which are slot-free and sticky for exactly the reason this bean gives.
It is already recorded in `rejected.md`.

Recommend scrapping once ADR-074 is built. Kept open until then because the
cap is still live in code.

## Reasons for Scrapping

As this bean itself recommended: ADR-082 deleted the storage cap (`STORAGE_PLANS`,
`storageCapFor`, `cappedStorage`, `revealsPlanTier`, and the clamp in
`addStorage`). There is no overflow to clamp at shop time and nothing for a
cap-extension voucher to extend.

The reasoning survives in rejected.md and is now load-bearing elsewhere: a capacity
raise must not take a pipeline slot, or every build runs it. Build space is rented
slot-free for exactly that reason.
