---
# DVTD-86nr
title: 'Config action popover: install/sell/upgrade'
status: completed
type: feature
priority: high
created_at: 2026-07-16T15:24:51Z
updated_at: 2026-07-16T15:40:30Z
---

Click a config chip to reveal contextual actions. Sell = remove + 50% draft-cost refund (new reducer action). Upgrade shown on chip. Downgrade deferred. Fixes: acquired configs can't be removed in the shop.

## Summary of Changes

- `config.model.ts` — `sellRefund(config)` = floor(draftCost/2) (market value).
- `sessionRun.model.ts` — new `sell` action (shop only): removes a non-fixed config, refunds half its draft cost (capped). Unit-tested (removes + refunds; refuses fixed).
- `ConfigActions.ui.tsx` — new stateful popover: click a chip → contextual action buttons.
- `Pipeline.ui` / `Loadout.ui` — optional `actionsFor(config)` renders chips as popovers (shop); falls back to the `✕` unslot in configuring.
- `ShopScreen.ui` — builds `actionsFor` (Sell +KB, Upgrade with cost/req in label), wires `onSell`.

## Deferred
- Downgrade (per decision).
- Redundancy flag: Upgrade now appears BOTH in the chip popover and the dedicated "Upgrade a config" card. Left both; needs a call on whether to drop the card.
- Tuning risk: selling starter/handed configs refunds half draftCost though they weren't bought — noted for balance.
