---
# DVTD-tf5k
title: Shop-trade acquisition surface for Tech Debt
status: todo
type: feature
priority: normal
created_at: 2026-06-14T07:37:23Z
updated_at: 2026-06-14T07:37:40Z
parent: DVTD-fapc
blocked_by:
    - DVTD-1cbu
---

Second TD acquisition surface: shop offerings can be discounted in exchange for TD risk. Builds on item-cost surface that lands in the Flaky Suite slice.

## Todos

- [ ] Shop offering data model: optional discount + techDebtCost fields
- [ ] Shop UI: show base price, discounted price with TD warning, and which TDs would be acquired
- [ ] Purchase flow: confirm dialog when TD cost > 0
- [ ] Soft cap interaction: if at cap, discounted variant unavailable (only base price shown)
