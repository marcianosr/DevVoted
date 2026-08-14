---
# DVTD-bmy0
title: 'In-run cosmetic shop: buy borders at 10% off with run storage'
status: todo
type: feature
priority: normal
created_at: 2026-06-04T08:05:50Z
updated_at: 2026-06-04T08:05:50Z
blocked_by:
    - DVTD-enj5
---

Let players buy borders inside the run shop using in-run storage at a 10% discount versus archive price. Creates a meaningful currency-bridge decision: spend in-run capacity for permanent ownership at a discount, vs hoard for full archive conversion.

## Design
- Discount: 10% (configurable constant). 256KB border → 230KB in-run cost.
- Payment: in-run storage (counts against storageLimit, same accounting as configs).
- Reward: border added to user's owned_border_ids permanently (no archive deduction).
- UX: borders shown alongside or near configs in the in-run shop UI.
- Once owned, hide from future in-run shop offerings (or show as owned).

## Touchpoints
- New service: src/domains/economy/services/borderPurchaseInRun.service.ts (discount calc + storage check)
- New server fn: purchaseBorderInRunServerFn (deducts in-run storage, appends to owned_border_ids)
- Schema: probably need to track in-run storage spent on borders separately (like rerollStorageUsed), so it counts toward storageUsed
- Shop UI: src/domains/economy/components/ShopContainer.component.tsx — add border section
- Storage accounting in getStorageInfo (configManager.service.ts)

## Blocked by
DVTD-enj5

## Todo
- [ ] Decide where 'border storage spend' lives — new column on runs, or inferred from cross-referencing user.owned_border_ids deltas
- [ ] In-run discount constant + cost calc
- [ ] Server fn + handler (atomic: check storage available, deduct, append)
- [ ] Shop UI integration
- [ ] getStorageInfo extension
- [ ] Tests
