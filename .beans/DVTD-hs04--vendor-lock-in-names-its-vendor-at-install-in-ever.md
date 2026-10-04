---
# DVTD-hs04
title: Vendor lock-in names its vendor at install, in every prep phase
status: completed
type: bug
priority: high
created_at: 2026-09-22T18:26:40Z
updated_at: 2026-09-22T18:37:58Z
---

Playtest: installing `vendor-lock-in` frees no space and everything stays sellable.

ADR-087 Decision 2 says the player "names the target, once, at install". The code
makes `commitVendorLock` a separate optional action behind a small `lock in` badge,
and `canVendorLock` only returns true while `status === "rewarding"`. So the 4 weight
buys nothing until a second press is noticed, and a starting-hand copy is inert until
the first shop after gate 0.

Not bugs (keep): selling `vendor-lock-in` itself releases the lock (Decision 5), and
the unlock is not circular (fallbackPollsAnswered 750).

## Todo

- [x] `canVendorLock` uses `isPrepPhase`, plus a no-legal-target clause to avoid a soft-lock
- [x] Reducer accepts `vendor-lock` throughout prep; `start` refuses while unnamed
- [x] `uninstallConfig` gains the vendor guard its siblings `sell`/`drop` have
- [x] Move vendor chip bits from shop/application into build/application
- [x] Shop footer holds to-prep with a visible refusal
- [x] New-run screen wires the pick and holds Start
- [x] Specs: domain, reducer, both screens
- [x] Docs: ADR-087 amendment, CHANGELOG, wiki

## Summary of Changes

The pick is now part of finishing the install, in both prep phases.

- `canVendorLock` reads `isPrepPhase` instead of `status === "rewarding"`, and gained a
  no-legal-target clause: a build holding only the locker has nothing it may name
  (Decision 4 forbids self-targeting), so the offer lifts rather than stranding the
  player behind a held exit.
- Reducer: `vendor-lock` accepted throughout prep; `start` refuses while a vendor is
  unnamed; `uninstallConfig` gained the vendor guard `sell` and `drop` already had.
- `VendorLockChip` / badges moved from `shop/application/shopScreen.viewmodel.ts` to a
  new `build/application/vendorChip.viewmodel.ts`, so both prep screens draw the same
  chip and the import direction stays shop -> build.
- Shop and new-run footers withhold their exit press and state `VENDOR_REMEDY`; the
  over-capacity refusal keeps priority as the harder block.
- `StartView` gained `onVendorLock`; `RunNew` and proto-run dispatch it.

12 new specs (6 domain, 3 StartView, 3 ShopView). Full suite 4068 passing.

### Deviations

- No `Fixed` changelog entry: the config itself is still in `[Unreleased]`, and
  `docs/changelog-maintenance.md` says a bug never shipped is never logged. The
  existing Unreleased entry was amended instead.
- `vendorChipFor` spells its return type out rather than `Pick<ConfigChipProps, ...>`:
  `ConfigChipProps` is `Redactable`, so a Pick distributes over the union and comes
  back with `badges` optional (TS2322).

### Pre-existing, untouched

8 failures in `versionOddsFor` / `offerOddsOf` (ADR-097 roll odds) across
`draft.model.spec`, `shopScreen.viewmodel.spec`, `dexScreen.viewmodel.spec` and
`Registry.spec`. Verified identical with this work stashed; in-flight branch work.
