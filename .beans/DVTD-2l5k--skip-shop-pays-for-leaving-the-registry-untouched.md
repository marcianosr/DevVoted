---
# DVTD-2l5k
title: Skip shop pays for leaving the Registry untouched
status: completed
type: feature
priority: normal
created_at: 2026-09-25T11:00:09Z
updated_at: 2026-09-30T11:04:06Z
parent: DVTD-r2k9
---

**What:** A default registry service beside Rebuild from the first shop: leave the Registry without touching it and be paid a small amount of storage.

**Why:** A shop with nothing worth buying is a dead screen, and leaving it should be a decision with a price like every other press.

## Done when

- [x] From the first shop, Skip shop sits beside Rebuild
- [x] Leaving with no registry action pays a flat amount of storage
- [x] The first registry action of the visit locks it for that visit
- [x] The payout never beats the cheapest draft
- [x] The Dex row states it

## Notes

- Marciano, 2026-09-25: "at the start, the default controls are rebuild and skip shop (skip shop is only when no interaction has found place, and the player receives a small amount of KB. It's locked if the player interacted with the shop)". Recorded as ADR-115 D4. This is DVTD-r2k9's "No Dependencies" service made a default instead of a licence.
- `SKIP_SHOP_KB` is a dial below the cheapest draft (`32 KB × slots`, so 32 KB for a one-slot config): 8 or 16 KB are the candidates.
- "Interacted" means any registry action this visit: draft, rebuild, lock or unlock, extend, minify, sell, upgrade, plant the tag, repackage. `rebuildsUsed`, `soldThisShop` and `draftedThisGate` already reset per visit in `finishReward` (`shopAction.model.ts`); locks, extends, upgrades and planting need a per-visit marker, e.g. `touchedThisShop` reset in the same place.
- Pays on the leave press, so it rides the `finishReward` path rather than a new reducer.
- Name: "Skip shop" is Marciano's word. The screen calls the offer list the Registry, so "Skip the registry" is the alternative; decide at build, and keep whichever the shop's own header uses.
- Roster row: `scope: "registry"`, opens with Rebuild at the first shop.

2026-09-25 (ADR-116): Skip shop is a **starter** service beside Rebuild; no objective, no grant row.

2026-09-25, later (ADR-115 D10): a starter enters the roster when its press exists, so Skip shop is not on the roster or in the Dex until this bean builds it; the Dex reads 1 of 8 without it.

2026-09-29 (ADR-153): a starter service carries free, so Skip shop needs no row on the warm boot panel; it enters the roster with its press as before.

## Summary of Changes

- Named **Skip the shop**; pays `SKIP_SHOP_KB` = 16 KB (below `CHEAPEST_DRAFT_COST_KB`, asserted in a spec).
- `RunState.shopVisit` (`touched` | `skipped`), reset by `finishReward`. `runAction.model.ts` marks a visit touched in one place: any `REGISTRY_TOUCHES` action that changes state while rewarding. A skipped visit refuses those actions, so skip-then-back-from-prep cannot draft. `vendor-lock` is excluded so a skip never soft-locks prep.
- New `skip-shop` action (bare wire schema, part of `SHOP_WRITES` so an audit-closed shop refuses it). The shop row pays and navigates to prep; it shows `registry touched` once shut and is inert while the build is over space or owes a vendor lock.
- Roster entry `skipShop` (starter, first shop); Dex reads 2 of 9. Wiki, ADR-115 D4, CONTEXT.md and CHANGELOG updated.
