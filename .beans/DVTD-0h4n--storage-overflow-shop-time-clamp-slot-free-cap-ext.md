---
# DVTD-0h4n
title: 'Storage overflow: shop-time clamp + slot-free cap-extension voucher'
status: todo
type: feature
created_at: 2026-08-06T09:45:39Z
updated_at: 2026-08-06T09:45:39Z
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
