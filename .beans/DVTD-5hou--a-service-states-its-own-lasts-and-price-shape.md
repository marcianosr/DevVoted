---
# DVTD-5hou
title: A service states its own lasts and price shape
status: completed
type: task
priority: normal
created_at: 2026-10-01T18:29:05Z
updated_at: 2026-10-01T18:33:57Z
parent: DVTD-y3vn
---

**What:** How long a service lasts and how it is priced are written once, on the service itself, and the collection screen reads them from there.

**Why:** The collection screen kept its own copy of those facts, so adding or changing a service meant a second edit that nothing checked.

## Done when

- [x] Each service says how long its purchase lasts and the shape of its price where the service is defined
- [x] The collection screen states the same lines and prices it did before, read from the service
- [x] Adding a service needs no edit to the collection screen
- [x] A check fails when a service carried in at new run has no shop price

## Notes

- dexScreen.viewmodel.ts held SERVICE_LASTS, CONTROL_PRICES (with literal NOT_YET_SOLD), PRESS_PRICES and a bootCache id check.
- Facts move onto RegistryControlSpec (run/shop/domain/registryControl.model.ts) as data: lasts and price. Words stay in the viewmodel per ADR-102 (the viewmodel picks a string from data).
- Coordinate: another agent edits heldOf and its call sites in the same viewmodel.

## Summary of Changes

- `RegistryControlSpec` gains `lasts: ServiceLasts` and `price: ServicePrice` (doubling, steps, rising, pays, rungs, free, unsold), figures read from the rules that charge them. `EXTEND_COST_KB` exported from `draft.model.ts`.
- `dexScreen.viewmodel.ts` drops `SERVICE_LASTS`, `CONTROL_PRICES`, `PRESS_PRICES` and the Boot Cache id check; it keeps the words (`LASTS_WORDS`, one switch over the price) per ADR-102.
- Four new roster tests incl. a guard that every carried service has a press price. Existing Dex strings unchanged.
- ADR-163 records the decision.
