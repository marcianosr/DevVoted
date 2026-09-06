---
# DVTD-ecyi
title: 'Config: HMR'
status: draft
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-20T13:27:13Z
updated_at: 2026-09-06T09:57:03Z
parent: DVTD-72d9
---

Shop agency on a new axis: not *what* the shop offers (WTFPL, ADR-029's breadth) but *when* you can reach it. Once per gate, the between-poll screen opens the shop.

## Mechanic

- Held config, fires from the between-poll surface (where Prefetch already lives).
- Once per gate. Configs bought take effect for the rest of the window.
- No use fee. You pay each config's normal draft cost out of banked KB.
- Offers the last shop's unbought roll, not a fresh one. A fresh roll would do Rebuild's job (ADR-029).

## Why the name

HMR replaces a module in a running process without a restart, preserving state. That is the mechanic exactly: swap a config into a live pipeline, answers so far intact, no new run.

## The live decision

Fire early or late, every gate. Early buys a Focus config for categories you can see coming. Late waits until the coverage shortfall is known and buys the multiplier that closes it. Perfect-information drafting once per gate is the product.

Works alone (you always know your own coverage), so Prefetch is synergy, not a dependency.

## Axes

- Reward: shop agency, timing half. Unused; WTFPL is the breadth half.
- No coverage multiplier, no correctness check, no faucet.

## Numbers, to tune

Rare, 192KB (rare baseline 128, plus 64 for the timing). Legendary if playtesting shows perfect-information drafting dominates.

## Implementation cost, not a one-line roster entry

Every shop action in `run.model.ts` is guarded on `status === "rewarding"` (draft, upgrade, rebuild-draft, lock-offer, extend-offers, plant-pin). Those guards must also admit `answering` while the config is held and the gate's charge is unspent.

- [ ] `Config.opensShopBetweenPolls` + roster entry
- [ ] Explicit `hmrSpentThisGate` flag on RunState, reset on gate advance (`heldAtGate` precedent: do not infer it)
- [ ] Reducer guards widened, with a spec that the charge is once per gate
- [ ] Shop reachable from the between-poll screen, and exits back to the same poll
- [ ] Wiki roster count, CHANGELOG

## Open

- Leftovers vs a fresh roll: leftovers chosen above to stay off Rebuild's axis. Confirm.
- Can you sell mid-gate, or only buy? Selling mid-gate turns a losing window into KB, which may be a second mechanic wearing this config's name.
