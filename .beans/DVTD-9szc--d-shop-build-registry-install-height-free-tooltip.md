---
# DVTD-9szc
title: 'D — Shop, build, registry: install height, free tooltip, shop title, upgrade bug, subscriptions'
status: completed
type: task
priority: normal
created_at: 2026-09-24T12:30:35Z
updated_at: 2026-09-24T13:21:57Z
parent: DVTD-c2ha
---

- [x] Item 14: LABEL_SHAPE.sm h-5 to h-7 (kit-wide, flag it)
- [x] Item 16: wrap the upkeep badge in a bare Tooltip explaining free
- [x] Item 18: shop title becomes '<next swatch> Shop'
- [ ] Item 19 BUG: upgradeChipFor version from heldLevel, install press not upgrade press
- [ ] Item 19: confirm the ADR-097 tension before going further
- [x] Item 20: mount a Ledger on prep fed from the existing subscriptions BillLedger
- [ ] Update shopScreen.viewmodel.spec, Registry.spec, ConfigChip.spec

## Progress

Done: 14, 16, 18, 20. **Item 19 is blocked on a decision** (see below).

**Item 14** was taken in workstream A, same file. Every `sm` press now stands `h-7`, and the `sm` glyph press `size-7` with it — the spec's stated intent is that a labelled press matches the glyph beside it, so raising one without the other would have broken the pairing it asserts. Badges stay 20px decoration; presses are 28px, a better touch target.

**Item 16.** The upkeep badge is wrapped in `<Tooltip bare>`, which exists for exactly this ("a trigger that already reads as one — a badge"). Chosen over the lifted `ConfigInfo` pattern: one sentence does not need lifted state.

**Item 18.** `shopTitleFor` reads `gateSwatchAt(cleared + 1).gateName` — already resolved a few lines down in `nextGateFor`, and the swatch track already pointed at `cleared + 1`. The summit has no next gate and keeps the bare word. `SEPARATOR` was left dead and removed.

**Item 20.** `billLedger` already produced the lines and `runView.viewmodel` already computed them; nothing had ever read them. `subscriptionsLedgerFor` turns that into a `Ledger` panel on prep. The shortfall sentence is NOT restated there — the Audits heading already owns it (ADR-102).

## Item 19 — blocked, not forgotten

The plan flagged an ADR tension here and it turned out to be real, in both halves of the report:

- "I should only be able to upgrade in the build, not from the registry" contradicts **ADR-097 decision 6** and `registryUpgradesFor`, which exist specifically so the registry's rolled offer can waive the coverage gate the Build press enforces. Removing it removes the ADR-053 bypass.
- "it is already level 2" traces to `version: offer.level`, which shows the *offered* rung as the pennant — and that is pinned by an explicit test, "wears the version on offer, not the one held".

So the row saying "v2" beside a press offering "↑ v2" is behaving as designed. The design is what reads wrong: the Build panel's pennant means *held*, the registry's means *offered*, and the same glyph carries opposite meanings on two surfaces.

A change was made and reverted rather than shipped against a documented decision. Awaiting the call.

## Item 19 — resolved

Decision taken: keep ADR-097's route, fix the glyph collision. `upgradeChipFor` now sets `version: heldLevel`, so the pennant means "what you hold" on the registry exactly as it does on the Build panel; the press continues to state the target. The coverage-gate bypass the registry offer exists for is untouched.

ADR-097 gained **decision 7** recording the amendment and why the original reading was reversed. Its test now reads "wears the version held, the press stating the one on offer" and asserts both halves.

## Item 3 — resolved

`BAND_OUTCOMES_NOTE` is now "Paid when the gate shuts. Miss it and you owe a peel, settled in KB or in configs."

The spec and story fixtures were updated to match, but kept as literals rather than importing the constant: `src/ui` may take types from modules, not values, so importing it would fail `lint:arch`. They are representative fixtures for a dumb component, not assertions about production copy.
