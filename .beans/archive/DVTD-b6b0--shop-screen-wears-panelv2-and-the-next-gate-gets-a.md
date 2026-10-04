---
# DVTD-b6b0
title: Shop screen wears PanelV2, and the next gate gets a panel
status: completed
type: task
priority: normal
created_at: 2026-09-14T11:59:18Z
updated_at: 2026-09-14T12:10:59Z
---

The shop is the last run screen still flat inside a framed Screen. Port it onto
PanelV2 on a bare ground, matching new run / prep / poll / gate outcome.

Beyond the layout, two structural moves from the mock: the header's cramped
"next gate" sentence becomes a panel of its own, and the registry's controls
split out into a second panel beneath the registry.

Out of scope by request: the registry's "3 in reach" badge, the control panel's
"3 actions" count, and the yarn.lock footer note.

## Todo

- [x] NextGate.ui + story + spec (PanelV2, Swatch state="current" for the dashed mark)
- [x] nextGateFor in shopScreen.viewmodel; header note drops to "gate N cleared"
- [x] Build panel: buildHeadOf + buildBillOf, upkeepLabelOf exported from WeightTrack
- [x] Build gains weightOffers flag; offers move to PanelV2.Footer
- [x] RegistryControl gains layout="row" (mirrors Audit)
- [x] Registry sheds controls + note; controls move to ShopScreenProps, note to NewRunScreenProps.registryNote
- [x] ShopScreen rewritten: five panels, ground="bare", footer in a headerless panel
- [x] ShopView passes nextGate + controls, drops note
- [x] Fixtures: controls move, LOCK_NOTE deleted, nextGate added
- [x] Specs: relocate 3 control tests, delete 2 note tests, update build meta
- [x] CHANGELOG + wiki check
- [x] lint, tsc, npm test

## Summary of Changes

Five panels on a bare ground: Next gate across the top, Build left, Registry and
Registry control right, the action bar in a headerless panel.

**Next gate** is new. `NextGate.ui` + `nextGateFor(cleared, unitsHeld)`, which
takes UNITS rather than a percent so the ratio/percent mixing trap cannot bite:
it derives both the reading and the band internally. The dashed mark is
`Swatch state="current"`, which already draws exactly that. Header note drops to
`gate 9 cleared`.

**Build head** is `buildHeadOf` + `buildUpkeepOf` (new exports), with `billWords`
promoted to `upkeepLabelOf` on WeightTrack rather than written twice. Both fall
through on the slots shape, because the live ShopView passes `slots` while every
fixture passes `weight`. Weight offers moved to the panel footer behind a new
`weightOffers` flag; Vacancy deliberately stayed in the body so the
cash-a-slot-back press keeps its box.

**Registry** shed `controls` and `note`. Controls are now
`ShopScreenProps.controls` and `RegistryControl` gained `layout="row"`
(mirroring Audit) so PanelV2.Row supplies the rule instead of doubling the
chrome. The note moved to `NewRunScreenProps.registryNote`, its only surviving
caller.

## Not built

- The mock's `3 in reach` badge, `3 actions` count and yarn.lock footer note were
  all skipped by request.
- Dropping the note removed the only explanation a live player gets for a
  405-closed shop, since ShopView never passes `audits`. Follow-up bean raised.

## Verification

ShopScreen.spec 27/27, Registry.spec 12/12, NextGate.spec 7/7. `npm test` 4309
passed, 6 skipped, 2 todo, with only the 2 pre-existing gate.model.spec "floor
rule" failures. `npm run lint` clean, depcruise 0 violations across 986 modules.
`npx tsc --noEmit` 0 errors.
