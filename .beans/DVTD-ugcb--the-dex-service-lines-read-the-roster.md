---
# DVTD-ugcb
title: The Dex service lines read the roster
status: todo
type: task
priority: low
created_at: 2026-09-25T19:45:54Z
updated_at: 2026-09-25T19:45:54Z
blocked_by:
    - DVTD-khhw
---

**What:** The Dex's service lines and standing prices read the service roster instead of their own tables.

**Why:** The Dex keeps two records keyed by service id beside the roster, so a ninth service or a price change is written twice and only one of the two fails to compile when missed.

## Done when
- [ ] The Dex derives each service's line and standing price from the roster and the price rules
- [ ] A service without a Dex line fails to compile

## Notes
Follow-up to the shop-and-poll slice of the deepening pass. The shop states this run's prices from `ShopControls`; the Dex states standing prices across runs, which is why the two were not folded together there. `dexScreen.viewmodel.ts` `SERVICE_LINES` and `CONTROL_PRICES`.
