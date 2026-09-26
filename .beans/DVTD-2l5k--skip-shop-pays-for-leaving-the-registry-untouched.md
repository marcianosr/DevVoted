---
# DVTD-2l5k
title: Skip shop pays for leaving the Registry untouched
status: todo
type: feature
priority: normal
created_at: 2026-09-25T11:00:09Z
updated_at: 2026-09-25T18:06:12Z
parent: DVTD-r2k9
---

**What:** A default registry service beside Rebuild from the first shop: leave the Registry without touching it and be paid a small amount of storage.

**Why:** A shop with nothing worth buying is a dead screen, and leaving it should be a decision with a price like every other press.

## Done when

- [ ] From the first shop, Skip shop sits beside Rebuild
- [ ] Leaving with no registry action pays a flat amount of storage
- [ ] The first registry action of the visit locks it for that visit
- [ ] The payout never beats the cheapest draft
- [ ] The Dex row states it

## Notes

- Marciano, 2026-09-25: "at the start, the default controls are rebuild and skip shop (skip shop is only when no interaction has found place, and the player receives a small amount of KB. It's locked if the player interacted with the shop)". Recorded as ADR-115 D4. This is DVTD-r2k9's "No Dependencies" service made a default instead of a licence.
- `SKIP_SHOP_KB` is a dial below the cheapest draft (`32 KB × slots`, so 32 KB for a one-slot config): 8 or 16 KB are the candidates.
- "Interacted" means any registry action this visit: draft, rebuild, lock or unlock, extend, minify, sell, upgrade, plant the tag, repackage. `rebuildsUsed`, `soldThisShop` and `draftedThisGate` already reset per visit in `finishReward` (`shopAction.model.ts`); locks, extends, upgrades and planting need a per-visit marker, e.g. `touchedThisShop` reset in the same place.
- Pays on the leave press, so it rides the `finishReward` path rather than a new reducer.
- Name: "Skip shop" is Marciano's word. The screen calls the offer list the Registry, so "Skip the registry" is the alternative; decide at build, and keep whichever the shop's own header uses.
- Roster row: `scope: "registry"`, opens with Rebuild at the first shop.

2026-09-25 (ADR-116): Skip shop is a **starter** service beside Rebuild; no objective, no grant row.

2026-09-25, later (ADR-115 D10): a starter enters the roster when its press exists, so Skip shop is not on the roster or in the Dex until this bean builds it; the Dex reads 1 of 8 without it.
