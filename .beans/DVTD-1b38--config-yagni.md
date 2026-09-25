---
# DVTD-1b38
title: 'Config: YAGNI'
status: todo
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-19T20:36:09Z
updated_at: 2026-09-24T12:49:22Z
parent: DVTD-72d9
---

**What:** A config that discounts the storage bill for every empty slot in the build.

**Why:** Pays you for not installing things, and it is the first config to touch the bill.

## Done when
- [ ] YAGNI can be drafted and installed
- [ ] Each empty slot lowers the bill by a set amount
- [ ] A spec covers zero, one and several empty slots

## Notes

Empty-slot config on the BILL axis (Marciano picked this axis over
storage-on-clear, 2026-08-19; Balatro Joker Stencil pattern).

Each empty pipeline slot discounts the ADR-023 storage subscription bill.
Don't install it, don't pay for it — the truest YAGNI. First config to touch
the bill/insolvency axis. Self-balancing late: gates grant slots, so keeping
them empty gets harder as the discount would grow. Numbers TBD (flat -KB per
empty slot per bill vs percentage). Family: economy, uncommon.
