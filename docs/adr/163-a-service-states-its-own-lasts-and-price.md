# ADR-163: A service states its own lasts and price

## Status

Accepted — 2026-10-01 (Marciano, DVTD-5hou). Applies
[ADR-102](102-copy-has-one-owner.md) §1 to the services roster.

## Context

The Dex's services tab restated facts the roster in
`run/shop/domain/registryControl.model.ts` should own: a `Record` of how long
each purchase lasts, a `Record` of row prices with literal "not for sale yet"
flags, a second `Record` of shop press prices for the carried services, and an
id check that singled Boot Cache out. Adding a service meant a second edit in
another context that nothing checked, and a price changed in the shop could
drift from the price the Dex quoted.

## Decision

1. **`RegistryControlSpec` carries `lasts` and `price` as data.** `lasts` is a
   closed union (`visit`, `run`, `endsRun`, `nextRun`, `atStart`,
   `firstShop`). `price` is the shape of what the press charges: `doubling`,
   `steps`, `rising`, `pays`, `rungs`, `free`, `unsold`. Figures come from the
   rules that already charge them (`rebuildCost`, `EXTEND_COST_KB`,
   `pinCostFor`, `SKIP_SHOP_KB`, `BOOT_CACHE_RUNGS`), never retyped.
2. **The words stay in the viewmodel.** Choosing the string reads the spec, so
   per ADR-102 §1 `dexScreen.viewmodel.ts` picks it: one `Record<ServiceLasts,
   string>` and one switch over `ServicePrice`. The roster holds no prose beyond
   its existing title, detail and unlock captions.
3. **A carried service's `price` is its shop press.** The row quotes the carry
   (`carryBytes`, ADR-153); the panel quotes both. A spec guard fails when a
   carried service is priced as anything but a press.

Adding a service is one roster entry; the Dex needs no edit unless the service
introduces a new `lasts` or price shape, which the type checker then demands.
