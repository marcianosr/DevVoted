---
# DVTD-lxla
title: Spots are rented per gate, not bought outright
status: completed
type: feature
priority: normal
created_at: 2026-08-28T12:23:24Z
updated_at: 2026-08-28T14:42:55Z
---

ADR-045 amendment. Buying a rung outright is replaced by renting individual spots against a per-gate bill: first rented spot 8 KB/gate, rising per spot. Gate rungs stay free and say so; the ceiling footer goes.

Rungs stay free and say so; the ceiling footer goes. Spots above the schedule are
RENTED, one at a time, billed at every clear.

## The rent

- `SPOT_RENT_STEP_KB = 8`. The nth rented spot is billed at `8 x n`, so n spots
  cost `4n(n+1)` a gate: 8 / 24 / 48 / 80 / 120 / 168 / 224 / 288.
- One spot per press. A rung is four spots; paying for four to install a bit is
  not a decision anyone makes twice.
- Renting takes nothing up front, but the balance must cover the new rate, so a
  run cannot rent itself into an instant default.
- Billed at each clear, after the reward and before config subscriptions.
- The schedule absorbs it: `rented = max(0, heldBefore - scheduledSpots(next))`,
  so the bill falls by itself and rent only ever buys time.
- Default (balance short): pays what it has, every rented spot goes back, width
  drops to the scheduled rung. Over capacity is reachable again, so the shop's
  exit lock is a live mechanic once more.

## Todo

- [x] rules.model: rent helpers, drop `earlyKb` / `rungHeldAt` / `rungAbove` / `spotRungFor`
- [x] run.model: `rentedSpots`, `spotRentKb`, `rentDefaulted`; `capacityFor` retired for `spotsHeldWith`
- [x] shopAction: `unlockRungEarly` -> `rentSpot` + `rentAvailable` / `canRentSpot`
- [x] runAction + run.validation: `unlock-rung` -> `rent-spot`
- [x] answer.model: rent settlement at the clear
- [x] subscription.model: rent line in `billLedger` (Prep + stake receipt)
- [x] gatePayout + RewardView + RewardScreen: rent on the clear ledger
- [x] Rung.ui: press out, `Free` in
- [x] PipelineCapacity.ui: footer out, rent row in
- [x] ShopView.component + legacy ShopScreen.ui + proto-run wiring
- [x] specs, stories, runView.factory
- [x] ADR-045 amendment, wiki, CHANGELOG

## Summary of Changes

Rungs are free and say so; the ceiling footer is gone. Spots above the schedule are
RENTED, one at a time, on top of the earned width, and the rent never expires.

**Two corrections landed mid-build**, both from Marciano on the screenshots:
1. The rent must not expire ("you rent spots ALWAYS when you go up the tree, it's
   like a subscription"). The first build had the schedule absorbing rented spots.
2. Rented spots sit ON TOP of earned width, so the press reads `rent +1 spot`.

**Numbers.** `nextSpotRentKb(n) = 8 + n`, so `rentPerGateKb(n) = 8n + n(n-1)/2`:
8 / 17 / 27 / 38 / 50 / … The step is a quarter of gate 0's perfect clear. The only
trim is at the ceiling — a spot 24 swallows stops being billed.

**Domain.** `rules.model.ts` lost `earlyKb`, `rungHeldAt`, `rungAbove`,
`spotRungFor` and gained `SPOT_RENT_STEP_KB`, `nextSpotRentKb`, `rentPerGateKb`,
`spotsHeldWith`, `rentableSpots`, `rentAfterClearing`. `run.model`'s `capacityFor`
retired for `spotsHeldWith`. `RunState.boughtRung` → `rentedSpots`, plus
`spotRentKb` and `rentDefaulted` for the clear's ledger. `unlockRungEarly` →
`rentSpot` + `rentAvailable`/`canRentSpot`. Action `unlock-rung` → `rent-spot`.
`answer.model` settles the rent after the reward and before config subscriptions;
a short balance pays what it has and returns every rented spot.

**Over capacity is live again**, since a default is the one thing that narrows a
pipeline. The exit lock from DVTD-i388 is a mechanic rather than an invariant.

**Ledger.** `billLedger` carries a `spot-rent` line, so the rent shows on prep and
the stake receipt; `gatePayout` + `RewardView` put it on the clear ledger, and the
reward screen names a default.

**Docs.** ADR-045 renamed to `045-spots-come-from-gates-kb-rents-more-on-top.md`,
Decisions 3 and 4 rewritten (it never shipped, so churn was not preserved as a
superseded section); README row, wiki §3/§5.1/§5.2/glossary/numbers; CHANGELOG lead
entry rewritten and the dead storage-plan entry deleted.

Boy-scout: cleared five stale "storage plan" strings (SpotTrack hover,
ConfiguringScreen width line, gatedex comment, GateStakeReceipt docstring, two
orphan StripScreen prop comments) and hid the receipt's `−0KB on a miss` line.

**Verified.** `npm run lint` clean (787 modules) · `tsc --noEmit` 0 errors ·
2578 passed / 3 failed, the three being the documented `RewardScreen.spec.tsx`
baseline (DVTD-9dn0) · story typecheck 25 errors, the same 25 as before.

## Revised again (same day): the mock is a staged ladder, not a press

Marciano's mock (Image #51) settled it. The section is **Extra spots**, a radio
picker of four steps on top of the free width, each rentable by the gate or buyable
outright, staged by depth.

| step | rent | opens on clearing | buy outright |
| --- | --- | --- | --- |
| +1 spot | 8 KB a gate | — | 80 KB |
| +2 spots | 16 KB a gate | gate 2 | 160 KB |
| +3 spots | 24 KB a gate | gate 5 | 240 KB |
| +4 spots | 32 KB a gate | gate 8 | 320 KB |

- Rent is **linear** at `EXTRA_SPOT_RENT_KB` (8) a spot: a step is its number times
  the rate, nothing to work out. The earlier rising rate is gone; **depth** stages
  the ladder instead.
- A step's row states the width it makes ("+2 spots · makes 10").
- Buy-out = ten gates of the step's rent, so it wins early and loses late.
  Deliberately not the mock's 160/320 for +1/+2: at 20 gates of rent it exceeds a
  13-clear run, so buying would be strictly dominated.
- `MAX_SPOTS` is 28 (24 free + 4 extra); `FREE_SPOTS_CEILING` is the gates' 24.
- State: `extraSpots` (step held) + `ownedExtraSpots` (paid off). Rent bills the
  difference. A default returns the rented part and keeps the bought part.
- Actions: `set-extra-spots` / `buy-extra-spots`, both with a bounded `spots` payload.
- `Rung.ui` + `PipelineCapacity.ui` deleted; `ExtraSpotRow.ui` + `ExtraSpots.ui`
  replace them, with specs and stories. `RunView.spotRungs` and `spotCeiling` are
  gone with them — nothing rendered them once the free ladder lost its rows.
- `rungOpensAt` → `gateFloorLabel`: it converts any `gatesCleared` floor now.

**Known and flagged:** the rent is cheap against gate income (32 KB a gate at the top
step vs a 320 KB clear at gate 9), so the default is very hard to reach — the smallest
gate-0 clear pays 6.4 KB against a maximum 8 KB rent there, and nothing deeper comes
close. The branch stays as the honest answer to an unpayable bill, and
`EXTRA_SPOT_RENT_KB` is the knob that makes it matter.

**Verified.** `npm run lint` clean (787 modules) · `tsc --noEmit` 0 errors ·
2589 passed / 3 failed, the three being the documented `RewardScreen.spec.tsx`
baseline (DVTD-9dn0) · story typecheck 25 errors, the same 25 as before.

## Rent-only: the buy-out is out

"For now just make it rentable only. Remove the buy button." Everything the buy-out
touched is gone rather than disabled:

- `extraBuyOutKb` + `BUY_OUT_GATES`, `buyExtraSpots`, `canBuyExtraSpots`, the
  `buy-extra-spots` action and its schema entry.
- `RunState.ownedExtraSpots` — the rent now bills the whole step, and a default
  returns the whole step.
- `ExtraSpotOption.owned` / `buyKb` / `buyTooDear`, `ExtraSpotRowProps.buy`, and the
  `Action` import in `ExtraSpotRow.ui` (the row has no press of any kind now).
- `onBuyExtraSpots` on both shop screens, `RunShop`, `proto-run`.
- `extraSpotTerms` loses its "owned" branch on both screens.

Copy: "Gates unlock spots for free. Rent adds more on top, by the gate."

The row keeps `settled`, because the `none` step's "free" still reads celadon —
that is the only settled case left.

## Verified

`npm run lint` clean (787 modules) · `tsc --noEmit` 0 errors · 2576 passed / 3 failed,
the three being the documented `RewardScreen.spec.tsx` baseline (DVTD-9dn0) · story
typecheck 25 errors, the same 25 as before.

Docs: ADR-045 Decision 4 rewritten as "renting is the only way to hold one", with the
buy-out recorded as built-and-pulled and its argument kept for if it returns; README
row, wiki §3/§5.1/§5.2/glossary/numbers, CHANGELOG lead entry.
