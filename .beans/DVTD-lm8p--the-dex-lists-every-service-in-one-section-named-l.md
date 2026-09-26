---
# DVTD-lm8p
title: The Dex lists every service in one section, named locked or not
status: completed
type: feature
priority: normal
created_at: 2026-09-25T17:52:32Z
updated_at: 2026-09-25T18:06:08Z
parent: DVTD-r2k9
---

**What:** The Dex's services tab is one section listing every service on the roster, each row naming where it is bought and how long it lasts, with its price or the line that earns it; a locked service shows its name.

**Why:** Two panels asked players to learn registry services and run services as two systems, and a redacted row cannot be aimed at.

## Done when

- [x] The services tab is one section with one count for the whole roster
- [x] Each row reads where the service is bought and how long the purchase lasts, then its price or how to earn it
- [x] A locked service shows its name, a ? glyph and the unlock line, in the Dex and the shop alike
- [x] The shop lists only the services it sells; an unlocked service nobody sells yet reads "not for sale yet"
- [x] Hot Reload, Return Policy, Boot Cache and Docker Image are on the roster with their unlock counters ticking
- [x] Boot Cache and Docker Image count at run end, off the archive credit and the dealt hand

## Notes

- Marciano, 2026-09-25: "Players shouldn't need to learn Registry Service and Run Service as two formal systems. Context decides where they are purchased." Recorded as ADR-115 D10; ADR-116 D3 amended to named, not redacted.
- Roster entry rule: an earned service enters the roster when its counter ticks, so the ledger starts counting; a starter enters when its press exists, so Skip shop waits for DVTD-2l5k.
- Presses and purchases stay with DVTD-r2fg, DVTD-rte1 and DVTD-0now.

## Summary of Changes

- Roster (`registryControl.model.ts`): eight services with `scope` and `soldIn` (shop or archive), a `ServiceSale` union so only a shop service carries an opening gate, `isSoldInShop`, and `ShopSoldId` derived from the roster so a new shop service fails to compile until the shop has a row for it. Captions shortened to sit where a price does.
- Counters: `banked-256-one-run` and `finished-holding-a-dealt-config`, one-shot, ticked by `endMetrics` in `objectiveProgress.model.ts` on the action that ends the run. `archiveCreditBytes` moved from the repository into `run.model.ts` and `finishSessionRun` calls it. `BOOT_CACHE_BANK_KB` dial in `rules.model.ts`.
- Dex: `controldex` is `{ control, unlocked }`; `dexControlsFor` returns one section (`rows`, `count`, `meta`, `note`) with a where-and-how-long line and a price per service, `not for sale yet` for an earned service with no press or purchase yet, `free` for kill -9. `DexControls.ui` renders one `DexPanel`; the gates column is gone.
- Row: `RegistryControl.ui` state is `{ locked?: false; price? } | { locked: true; unlock }`, a locked row rendered as a `?` glyph, the name, the detail and `unlock · …` in the price slot, never a press; `price` optional; `Redactable` and "Locked service" gone from the row.
- Shop: `controlsOf` filters `isSoldInShop`; locked rows are named; `stagedRowFor` is keyed by `ShopSoldId`, Hot Reload and Return Policy inert until their presses.
- Docs: ADR-115 D10 and D11, ADR-116 D1 and D3 amended, README, wiki (§2.1, §5.2, §6.2, §6.4, glossary, numbers), CONTEXT, CHANGELOG. Specs and factories updated; the stories read the factory.
