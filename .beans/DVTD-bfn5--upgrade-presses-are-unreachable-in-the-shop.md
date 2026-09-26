---
# DVTD-bfn5
title: Upgrade presses are unreachable in the shop
status: completed
type: bug
priority: high
created_at: 2026-09-23T13:50:06Z
updated_at: 2026-09-23T14:03:47Z
---

Config upgrades are missing from both surfaces that should sell them. The domain,
reducer and wire schema are intact; only the presentation seam is broken.

**Break 1 - the registry's rolled upgrade is on screen but inert.** `upgradeChipFor`
gives the chip an `upgrades` panel and no `install` press, so the only way to buy is
the `up vN` button, which calls `onToggleUpgrades` to open the `Upgrades` panel whose
Buy card fires `onBuy -> onDraft`. `Registry.ui.tsx` wires `infoOpen`/`onToggleInfo`
but has never wired `upgradesOpen`/`onToggleUpgrades`, so `onPress` is undefined and
the panel is unreachable.

**Break 2 - the Build panel has no Upgrade press at all.** Commit 21fbcb80 (ADR-097)
removed `ShopViewProps.onUpgrade` and proto-run's `dispatch({type:"upgrade"})`.
ADR-097 decision 6 says the `upgrade` action belongs to the Build panel alone, but
`buildChipFor` never attaches `upgrades`, so `upgradesFor()` and the `upgrade`
reducer branch are orphaned.

Both survived because the specs assert a button exists, not that it does anything.

## Todos

- [x] Registry.ui: thread openUpgrades / onToggleUpgrades through to ConfigChip
- [x] Build.ui: same pair on BuildProps and the private Chip
- [x] Upgrades.ui: add a `refusal` line (ADR-053 decision 2)
- [x] configChip.viewmodel: upgradesFor takes a deal, disables and refuses
- [x] shopScreen.viewmodel: buildChipFor attaches upgrades when isUpgradable
- [x] ShopView: own openUpgrades state, restore onUpgrade prop
- [x] RunShop.component + proto-run: dispatch { type: "upgrade", configId }
- [x] Tests that assert the press works, not that it renders
- [x] Wiki: shop action table lists Upgrade as live

## Summary of Changes

Both presses are live again.

**Kit** — `Registry.ui.tsx` and `Build.ui.tsx` now thread `openUpgrades` /
`onToggleUpgrades` down to `ConfigChip`, mirroring the `openInfo` pair they
already carried. `ConfigChip.ui.tsx` needed no change: it always took those
props and always ranked arming > upgrading > info. `Upgrades.ui.tsx` gained a
`refusal` line (cinnabar hint under the held->offer pair), restoring ADR-053
decision 2 after `upgradeShortfalls` was deleted.

**Application** — `upgradesFor(config, deal?)` now takes a `BuildUpgradeDeal`
(`storageKb`, `coveragePct`, `onBuy`). `upgradeRefusalOf` words the two
refusals the reducer enforces silently: the coverage gate first ("Unlocks at 5%
JavaScript coverage, you have 2%."), the shortfall otherwise ("32 KB short").
Neither fires on a config already at its ceiling. `buildChipFor` attaches the
panel only when `isUpgradable(config)`.

**Presentation** — `ShopView` owns `openUpgrades` beside `openInfo`, each
toggle closing the other so one panel is open at a time across both columns.
`onUpgrade` is back on `ShopViewProps`, dispatched as
`{ type: "upgrade", configId }` from `RunShop.component.tsx` and `proto-run.tsx`.
No server change: `run.validation.ts` already validated the action.

**Tests** — 21 new, all asserting the press *works* rather than that it renders,
which is what let both breaks through. `kantoPoll.factory` gained
`kantoUpgradeOffer(onBuy)` so the kit spec never imports the roster
(`lint:arch` rejects a value edge from `src/ui` into `src/modules`).

**Docs** — `docs/wiki.md` s4.4 described the press as a hover hint on an armed
upgrade; it now describes the panel that ships. Two `Unreleased` changelog
entries claimed behaviour the code did not deliver (the rolled offer being
buyable, the refusal appearing on hover) and were corrected rather than given a
`Fixed` entry, both breaks being unreleased work.

Verification: 3591 tests pass (186 files, up 21 from 3570), `tsc --noEmit`
clean, `oxlint` clean, `depcruise` clean, wiki in sync, prettier clean.

## Deferred

Flagged, not fixed, all pre-existing:
- `ShopOffer.upgrades: boolean` is written by `offersFor` and read by nothing.
- `upgradePreview` / `UpgradeChange` are dead — ADR-053 decision 1, which lost
  its surface in the same refactor. Restoring it means an armed state on the press.
- `lock-offer` / `unlock-offer`, `drop` and `minify` have the same shape: domain
  plus schema present, no dispatcher.
