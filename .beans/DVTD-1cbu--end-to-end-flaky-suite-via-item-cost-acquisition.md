---
# DVTD-1cbu
title: End-to-end Flaky Suite via item-cost acquisition
status: in-progress
type: feature
priority: normal
created_at: 2026-06-14T07:37:08Z
updated_at: 2026-06-14T15:29:36Z
parent: DVTD-fapc
blocked_by:
    - DVTD-psi6
---

Smallest viable end-to-end slice. Flaky Suite is chosen as the first TD because it has the smallest blast radius — locks the shop, clears on earning 2 awards. No pipeline mutation, no UI hiding, no new mechanics invented beyond TD itself.

## Todos

- [ ] Hook into item pickup flow — items can declare techDebtCost: TechDebtTemplateId[]
- [ ] On item pickup with TD cost: spawn TD instances on the active run, attach to run state
- [ ] Implement Flaky Suite debuff: shop interactions check active TDs, refuse access when Flaky Suite present
- [ ] Implement Flaky Suite clear condition: subscribe to award-earned events, increment progress, auto-clear at 2
- [ ] Soft cap enforcement: if at cap, item with TD cost is non-pickable (gray out + tooltip)
- [ ] One test item in pool: 'TODO: rename in test data' — coverage benefit + 1 Flaky Suite
- [ ] Integration test: pick item → shop locked → earn 2 awards → shop unlocked


## Surface change

**Acquisition surface for this slice changed from item-pickup to shop-trade.**

DevVoted has no item-pickup system — what was abstractly called "items" in the design conversation maps to **configs purchased from the shop** in this codebase. There's nothing to hook a `techDebtCost` into for raw items. The shop exists with `run_shop_offerings` infrastructure, so it's the natural first surface.

Original todos (item-based) replaced with:

- [ ] Add `tech_debt_cost` field to shop offerings (a list of `TechDebtTemplateId` the buyer would acquire)
- [ ] Seed one Flaky Suite shop offering: a discounted config purchase that costs 1 Flaky Suite TD
- [ ] On shop purchase: if offering has tech_debt_cost, spawn TD instances on the active run
- [ ] Implement Flaky Suite debuff: shop access guard refuses interaction when Flaky Suite is active
- [ ] Implement Flaky Suite clear: hook into award-earned event, increment progress, auto-clear at 2
- [ ] Soft cap enforcement: if at cap, offerings with tech_debt_cost are hidden or marked unaffordable
- [ ] Shop UI: show TD cost on the offering, confirm dialog before purchase
- [ ] Integration test: buy discounted offering → Flaky Suite active → shop locked → earn 2 awards → unlocked

DVTD-tf5k (separate shop-trade bean) is now redundant and will be scrapped.
