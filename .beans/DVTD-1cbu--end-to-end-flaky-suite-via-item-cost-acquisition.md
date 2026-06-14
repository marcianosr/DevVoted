---
# DVTD-1cbu
title: End-to-end Flaky Suite via item-cost acquisition
status: todo
type: feature
priority: normal
created_at: 2026-06-14T07:37:08Z
updated_at: 2026-06-14T07:37:40Z
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
