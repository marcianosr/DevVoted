---
# DVTD-plrc
title: The git tag is carried in on a deposit and placed for run storage
status: completed
type: feature
priority: normal
created_at: 2026-09-25T11:00:08Z
updated_at: 2026-09-29T17:02:47Z
parent: DVTD-r2k9
---

**What:** A flat archive deposit before the run carries one unplaced git tag in; placing it at a gate 4 to 10 shop costs that gate's price from run storage.

**Why:** The tag is the one purchase that helps a run other than the one paying, and its whole price landed on the run that was already struggling.

## Done when

- [ ] Without a deposit the shop never offers the tag
- [ ] Placing the tag charges the gate's price from run storage and burns on use, as today
- [ ] An unplaced tag is gone when the run ends
- [ ] A first run with an empty archive is told why the tag is absent

## Notes

- ADR-115 D3. `pinCostFor` (`rules.model.ts`: 128 KB at gate 4, +64 per gate, 512 at 10) is unchanged; the deposit is a new dial beside `PIN_*`, priced knowing a first run can never afford it.
- `plantPin` (`shopAction.model.ts`) gains a precondition: the run carries the service. `pinAvailable` reads it so the shop row is absent, not refused.
- ADR-036 D2 (burn on use) and D3 (the stipend) stand. ADR-112 D4 holds: the deposit is pre-run, the placement is run KB, nothing inside a run spends the archive.
- Depends on the run-services purchase bean for the waiting row and its consumption at run start.

## Summary of Changes

Built 2026-09-29 under ADR-153 with DVTD-0now: the deposit is the carry, `PIN_CARRY_BYTES` (128 KB) on the roster row, ticked on the new run screen's warm boot panel and paid by the start press. `pinSoldAt` requires `carries(state, "pin")`, so a run that did not carry one is never sold a tag; the shop names the row with `new run · 128 KB` and no press. Placement (`pinCostFor`) and burn on use are unchanged. A first run with an empty archive sees the row with its price on the panel, refused by the shortfall.
