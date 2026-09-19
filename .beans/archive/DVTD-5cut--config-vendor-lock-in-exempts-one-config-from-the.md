---
# DVTD-5cut
title: 'Config: vendor-lock-in exempts one config from the space it fills'
status: completed
type: feature
priority: normal
created_at: 2026-09-15T13:50:46Z
updated_at: 2026-09-15T14:04:36Z
parent: DVTD-72d9
---

One config in the build stops counting against the build space you rent; in exchange it cannot be sold or dropped for the rest of the run. Pick happens on install, in the shop.

Supersedes DVTD-kf93 (--save-exact: draft 20% cheaper, can't sell), which bought the same unsellability drawback with a smaller upside.

Plan: ~/.claude-work/plans/i-wanna-build-this-structured-sphinx.md

## Why a space exemption is the payout

The gate bill is upkeepForSpace(build.slots): the rung rented, not the weight filled (ADR-082 d1). settleUpkeep never sees the configs, so a per-config exemption cannot cut the bill directly. It stops the locked config consuming the rung, which the player banks by renting one rung lower.

## Balance

4 weight / 128 KB. Its own weight sets break-even, so no artificial cap: locking a 2 is worse by 2, a 4 is neutral, an 8 saves 4, a 16 saves 12. It only pays on configs heavier than itself.

## Decisions

1. Pick on install, in the shop, over the current build.
2. Cannot target itself (that is the purchasable free weight ADR-082 retired).
3. The peel can still take it: a forced drop is neither a sale nor a swap, and it keeps a soft-lock unreachable.
4. Any removal clears the lock so the id can never dangle. Mirrors locksSurviving.
5. Selling vendor-lock-in clears the lock. Self-corrects via the shop door.
6. The chip keeps printing its real weight, marked free (pillar 2).

## The load-bearing implementation choice

The lock lives on Build, not on the Config instance and not on RunState. refreshConfig (runSnapshot.model.ts:39) rebuilds every build config from the roster and preserves ONLY level, so the minified precedent is not safe to copy. A field on Build survives hydration for free, and freeSlots/hasRoomFor/overflowSlots/isOverCapacity already take Build so they read it with zero signature changes.

## Todos

- [x] build.model.ts: Build.vendorLockedConfigId, billableSlotsOf, redirect the four helpers, lockSurviving prune
- [x] config.model.ts: vendorLocks flag; configRoster.model.ts: the vendorLockIn row
- [x] New build/domain/vendorLock.model.ts: vendorLockerFor, canVendorLock, commitVendorLock
- [x] runAction.model.ts: vendor-lock action + SHOP_WRITES; guards in sell and drop
- [x] run.validation.ts: configActionSchema(vendor-lock)
- [x] runView.viewmodel.ts + shopScreen.viewmodel.ts projection and refusal
- [x] Kanto shop lock press (visible refusal as label, never hint)
- [x] Live old-theme ShopScreen loadoutActions: disabled + Tooltip, extend widthRefusal verb union
- [x] WeightTrack free segment chrome (not needed: weight figures stay honest, the locked-in badge carries it)
- [x] Unlock row at fallback 750 + configs-vendor-locked metric + bump toBe(29) to 30
- [x] ADR-087 + README Live row
- [x] wiki 4.3 (count + roster row) and 2.8
- [x] CHANGELOG Added entry
- [x] VendorLockIn.stories.tsx + register in configStories.spec.tsx
- [x] Scrap DVTD-kf93 with Reasons for Scrapping

## Summary of Changes

Built as planned, with two deviations noted below.

**Domain**
- `Build.vendorLockedConfigId`; new `billableSlotsOf(build)` that `freeSlots`, `hasRoomFor`, `overflowSlots` and `isOverCapacity` now measure. `occupiedSlots` still means total carried weight, so the peel quota and audit 413's burn are unchanged.
- `withVendorLockSurviving` prunes the lock, and it lives **inside `withBuild` and `stripConfig`** rather than at each call site. That covers the engine's own removals (decay, subscription lapse) without either of them knowing the lock exists.
- New `build/domain/vendorLock.model.ts`: `canVendorLock`, `commitVendorLock`, `isVendorLocked`.
- `vendor-lock` action in SHOP_WRITES; `sell` and `drop` refuse by identity on the locked config.

**Deviations from the plan**
1. The roster row sits **before** `dryRun`, not last. `gate.model.spec` pins `CONFIG_LIST.at(-1)` to Dry Run because fixtures slice the roster positionally; keeping that invariant was cheaper than rewriting the fixture contract.
2. **No WeightTrack `free` chrome was added.** A zero-width segment would have been invisible, and the config deliberately keeps printing its real weight (decision 6), so there was nothing to draw. The `locked in` badge carries the meaning instead.

**Verification**
- `npm run build`: exit 0, zero type errors.
- `npm run lint`: clean, no dependency violations (999 modules). Two pre-existing warnings in untouched story files.
- `npx vitest run`: **4455 passed**, 2 failed, 6 skipped, 2 todo.
- The 2 failures are `gate.model.spec.ts > the floor rule` and are **pre-existing** — verified by removing the roster entry and re-running, where they still failed.
- New coverage: 13 specs in `vendorLock.model.spec.ts`, 5 in `ShopView.spec.tsx`, 2 story pages registered in `configStories.spec.tsx`.

**Follow-up filed:** DVTD-2cmy, `refreshConfig` drops every run-set config field except `level` (found while tracing hydration; Deprecated's decay is the one reachable case). Not verified end to end.
