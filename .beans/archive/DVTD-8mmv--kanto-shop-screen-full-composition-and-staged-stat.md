---
# DVTD-8mmv
title: 'Kanto shop screen: full composition and staged states'
status: completed
type: feature
priority: normal
created_at: 2026-09-10T15:30:18Z
updated_at: 2026-09-10T16:01:39Z
---

Compose the full kanto ShopScreen per mock #411: storage plan section, audits band (405), staged registry controls (Rebuild / Extend / git tag), yarn.lock footnote and lock badges, plus stories for every staged state. Plan: ~/.claude-work/plans/lets-design-the-shop-rippling-wren.md

## Todos

- [x] Header.ui: optional title + note overrides
- [x] RegistryControl.ui: refusal arm (cinnabar badge, disabled press)
- [x] Registry.ui: note footnote under controls
- [x] ShopScreen.ui: audits band, plan section (bill + rungs), width unchanged
- [x] Factory: kantoShopControlsAt, kantoShopHeaderAt, plan bag, LOCK_NOTE, lock badges, closed-shop frame
- [x] Stories: UnderAGate (mock frame), FirstShop, TagOnSale, LateShop, LockedOffers, ShopClosed, WithPanels modals
- [x] Specs: ShopScreen, Header, RegistryControl, Registry
- [x] lint + tests + build + stories typecheck + prettier check
- [x] Follow-up bean: Continue footer / exit locks (DVTD-b9xx)

## Summary of Changes

**Tier 1 (four files, no new components).** ShopScreen composes the whole of mock 411: an audits band under the header (PollScreen's exact composition), and a Storage plan section in the build's column — an h3 over a Panel holding "Your cap", the pre-formatted bill ("billed 224 KB at the next clear"), the fixed burn prose, and the existing StoragePlan ladder. `plan` is required: every shop sells storage. Header gained pre-formatted `title`/`note` overrides so the shop can read "Shop · cleared Volcano" / "next gate 10 · Earth · to pass 250%" while PollScreen's gate reading stands untouched. RegistryControl gained `refusal`: the shortfall replaces the price in a cinnabar badge, the press dies, and the row's accessible name keeps title · price · refusal (the slot-offer law, DVTD-e06m). Registry gained `note`, the one trace of a hidden control.

**Staging is the factory's, derived from the engine.** `kantoShopControlsAt(cleared, balance, extensionsBought, rebuildsUsed)` restates ADR-029 off the reducer's own constants: Rebuild always (`rebuildCost`), Extend from `EXTEND_FROM_GATE` until `MAX_EXTENSIONS`, git tag inside `PIN_FROM_GATE..PIN_UNTIL_GATE` at `pinCostFor` — hidden when unstaged, refused via the existing `shortfallOf` (still the only shortfall subtraction). `kantoShopHeaderAt` derives the title from the cleared swatch and the note from `coverageDemandFor(next.gate)`. `kantoShopPlan` wraps `kantoStorageRungs` + `planBillKb` (zero bills print "0 KB" — `NOTHING_BURNT` renamed `ZERO_KB` and shared). `offersAt(balance)` now sources `kantoRegistryOffers`, so every frame prices the same five against its own balance.

**The mock frame kept the 96 KB balance.** Mock 411 reads 320 KB (room-refusals, tag 128 short); a dozen specs pin the 96-frame strings (`24 KB short`, `buy slot 11 · 120 KB`), so the default frame stays and the engine reprices the tag honestly: `pinCostFor(9)` = 448 → `352 KB short`. Same reading, different figure.

**Seven stories, one per staged state.** UnderAGate (mock 411), FirstShop (gate 0: empty build, free four, Rebuild alone, ladder masked above the always-revealed rungs), TagOnSale (gate 4, tag affordable), LateShop (gate 11: tag gone, both extends spent, seven offers), LockedOffers (`withLockBadge`: yarn.lock's padlock as the existing pressable-badge arm, first offer armed/held, upgrade offer never locks, footnote dropped), ShopClosed (405 `read-only` audit via `kantoClosedShopProps`, every press stripped: badges disabled, uninstalls gone, upgrade cards inert, rungs pressless, controls disabled), and WithPanels grew the PlanChange and Uninstall modals as story state (`kantoShopUninstalls` record, one per build chip).

Redactable narrowing follows SlotOffer's precedent: `openChip` throws rather than asserts, so a locked chip cannot slip through fixture composition.

## Verified

tsc clean, oxlint clean (one pre-existing Screen.stories warning), depcruise 0 violations over 930 modules, 4046 tests pass in 227 files (kanto-theme alone: 675 in 33), build clean, stories typecheck at exactly the 30-error baseline with none in touched files, prettier clean on all ten touched files.

## Not done

No Continue footer / exit locks (DVTD-b9xx, needs a design). Room-refusals ("needs 4 slots, 1 free") still read as plain dimming on a kanto chip — DVTD-ilfw's call; revisit if a playtest asks why a row is dim.
