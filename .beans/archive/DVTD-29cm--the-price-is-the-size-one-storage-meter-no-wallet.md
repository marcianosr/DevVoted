---
# DVTD-29cm
title: Capacity is spots, money is KB
status: completed
type: feature
priority: high
created_at: 2026-08-27T13:59:42Z
updated_at: 2026-08-27T15:23:31Z
---

Part B of the 2026-08-27 rarity/storage brief (Part A shipped as ADR-043 / DVTD-ym11).

KB stops being a wallet and becomes only space. A config's price IS its size, occupying
the room is the payment, slots are retired, a gate clear grants headroom, and one
df-style segmented bar is the only meter in the game.

## Balance answers (Marciano, 2026-08-27)

- **Grant curve**: `GRANT_KB = 16` on the existing `(gate+1) x correct/5` curve. Perfect
  13-gate run earns 1456 KB, summit disk 512 + 1456 = 1968 KB, end-game 9-11 configs.
- **Residue**: split. Per-poll fees (lint, peek) clear at the window close; rebuild
  leftovers, uninstall residue, the git tag and the plan bill persist for the run.
- **Peel floor**: gates 0-2 peel at most half of installed size, so a single-config
  build survives its first miss.
- **Minify**: one-way, halves the config's bonus.
- Assumed (not blocking): Volkswagen CI becomes a byte (512); Freemium keeps size 0 and
  its escalating bill is the whole price; no `CONFIG_OVERHEAD_KB` in the first build.

## The model

    ceiling = FREE_DISK_KB (512) + earnedCeilingKb + rungAdditionKb
    used    = sum of sizeOf(installed) + residueKb
    free    = ceiling - used

`earnedCeilingKb` accumulates gate grants and is never taken back. `rungAdditionKb` is
rented from the storage plan and is lost on insolvency. Plan rows therefore read as
additions (`+256 KB . 8 KB a gate`), not absolute caps.

## Todo

- [x] ~~Run-state reshape for the one-meter model~~ — reverted; KB stays a wallet, `Pipeline.spots` carries capacity instead. No `engine_version` bump needed
- [x] Spot pricing: `spotsOf` from the grade, `hasRoomFor` as the one room check, minify
- [x] Slot ladder replaced by the three-rung spot ladder; `widened` becomes `recapacitied`, `justUnlockedSlots` becomes `justGrantedSpots`, `SlotUnlockRow` becomes `SpotGrantRow`
- [x] ~~Grants replace the wallet payout~~ — reverted; `gateClearPayout` keeps paying KB, and spots come from their own ladder
- [x] ~~Residue~~ — dropped with the one-meter model; there is no space to leave behind when spends are paid in KB
- [x] Peel becomes a SPOT quota (share of occupied spots) with the half-build floor before gate 3
- [x] ~~One StorageBar~~ — not needed; KB keeps its existing meters, and spots are a track with no unit
- [x] Per-screen passes: new run, shop, prep, configuring, dex. Pipeline rail still draws one cell per free spot rather than variable-width bars — follow-up
- [x] Gate Dex: the spot grant replaces the numbered slot unlock, and the plan rung names its rented spots
- [x] ADR-044 + ADR-041/043 supersession markers + README index + wiki + CHANGELOG + CONTEXT.md

---

## REDIRECTED 2026-08-27 — the one-meter model was abandoned mid-build

Marciano rejected collapsing capacity onto KB before it shipped, with a fatal
objection: configs multiply coverage, coverage earns KB, and if KB also buys width
then width buys coverage buys width — a reinforcing loop with no brake.

The correction is NOT that money may never buy width (Balatro sells joker slots).
It is that width has a **ceiling**, measured in something the score cannot inflate.

**What shipped instead — ADR-044:**

- Capacity is **spots**, drawn as a track, never written with a unit. A config takes
  as many spots as its grade has bits: bit 1, crumb 2, nibble 4, byte 8. The ADR-043
  glyph IS the price.
- Owned width: 4 spots, 6 on the gate 3 clear, 8 (a byte) on the gate 7 clear. Gate
  clears only — the coverage axis ADR-041 restored is deleted.
- Rented width: the storage plan rents +4 / +8 / +16 spots (a nibble, a byte, a word)
  alongside its KB cap, for a hard 24. Repossessed on an unpaid bill.
- Over capacity is a legal state resolved by the player (minify / uninstall / rent),
  never by the engine evicting a config.
- Minify halves spots and halves the bonus, one way. A bit cannot minify.
- The peel is a share of occupied spots (20% to 35%), capped at half the build before
  gate 3 so minifying alone can always pay it.
- KB is untouched, and ADR-043 Decision 6's doubling is reverted to 32/64/128/256.

## Summary of Changes

**Domain.** `spotsOf` / `canMinify` / `minify` / `minifySavingSpots` on the config, with
`minifiedMultiplier` / `minifiedAmount` applied at every bonus read site (a multiplier
halves the part above 1, so x1.25 becomes x1.125; a throttle is a cost and is NOT
halved). `Pipeline.slots` becomes `spots`; `SLOT_UNLOCKS` and its eight grants replaced
by `SPOT_LADDER` / `ownedSpotsFor` / `nextSpotGrantFor`, plus `occupiedSpots`,
`freeSpots`, `hasRoomFor`, `overflowSpots`, `isOverCapacity`. `capacityFor(gate, plan)`
in `run.model`. `STORAGE_PLANS` gains `addsSpots` and collapses to four rungs.
`failStripsFor` / `isStakeFatal` become `failPeelShareFor` / `peelQuotaSpotsFor` /
`isPeelFatal`; audits carry `peelShareOnFail` instead of `stripQuotaOnFail`.
`stripsRemaining` renamed `peelSpotsRemaining` (18 files). New `minify` action, wired in
both the shop (`minifyConfig`) and the peel screen (`minifyForPeel`), and added to
`runActionSchema` — the `Assert` tripwire caught its absence.

**Application.** `OfferRefusal`'s `no-slot` becomes `no-room` carrying `spots` and
`freeSpots`, and the check is now per config rather than per shelf: a bit fits where a
nibble does not. `RunView` exposes `spots` / `spotsUsed` / `spotsFree` / `overflowSpots`
/ `installed` / `nextSpotGrant` / `justGrantedSpots`. `GateStake` carries
`peelSpotsOnFailure` and `peelShareOnFailure`.

**Presentation.** `SlotUnlockRow` deleted, replaced by `SpotGrantRow` (no ordinals — a
spot has no identity). `RoleList` takes `freeSpots` instead of deriving
`capacity - rows.length`, which is meaningless now. The retired width demand ("Needs at
least N configs") becomes the overflow block that actually does gate a start.
`StartScreen` reads `canStart` from the engine rather than re-deriving "every spot
filled". The Dex grade header shows spots, not KB.

**Caught by a spec, not by me:** the byte rung was placed at gate 5, where Read-only
shuts the shop — a rung you can see but cannot buy. Moved to gate 4. That invariant
spans two modules that know nothing of each other, so the spec is its only home.

**Verification.** `npm run lint` clean (oxlint + dependency-cruiser, 781 modules).
`npm run build` clean. `npx vitest run`: 2497 passed, 3 failed — the three are the
pre-existing `RewardScreen` copy assertions (DVTD-9dn0), the documented baseline.

**Docs.** ADR-044 written; ADR-041 marked superseded and ADR-043 Decision 6 marked
reversed, both inline and in the README index. Wiki sections 2.2, 2.6, 2.8, 3, 4.1,
5.1, 5.2, 8, 9 and 10 rewritten. Two CHANGELOG entries rewritten in place (neither had
shipped); entry count unchanged at 216. CONTEXT.md rows updated.

**Not done, deliberately:** the pipeline rail still draws one cell per free spot rather
than variable-width bars per config. That is the visual redesign in the mock and is
follow-up work, not part of the rules change.
