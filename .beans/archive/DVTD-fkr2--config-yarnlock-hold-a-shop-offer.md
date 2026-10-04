---
# DVTD-fkr2
title: 'Config: yarn.lock, hold a shop offer'
status: completed
type: feature
priority: normal
created_at: 2026-08-24T15:12:42Z
updated_at: 2026-09-03T19:38:10Z
parent: DVTD-72d9
---

A config named yarn.lock that lets you hold a shop offer, paying KB per lock.

## Read this first: most of it already ships

Locking an offer exists today as a shop control (ADR-029), not a config:

- `LOCK_COST_KB = 16`, `MAX_LOCKED_OFFERS = 1`, `LOCK_FROM_GATE = 2`
  (`shop/domain/draft.model.ts`).
- `ShopScreen.ui.tsx` already renders a per-offer affordance: a corner `Badge` reading
  "Lock config", with a tooltip quoting the price against your storage when you cannot
  afford it. It holds the offer to the next shop.

So "lock an offer, pay KB every time" is the shipped behaviour. The only literally new
thing in the ask is the *icon*: today it is a text badge, not a lock glyph, which is a
small UI change and does not need a config.

## Which of these is the actual want

- **A. Just the icon.** Swap the "Lock config" badge for a lock glyph. Consistent with
  shop row presses being glyphs while shelf presses stay labelled. Ten minutes, no
  design.
- **B. yarn.lock extends locking.** The config buys a better version of the control:
  more than one held offer, or a longer horizon. ADR-029 frames controls on three
  horizons (this visit, next shop, rest of run) and Lock sits at "next shop". A lockfile
  pins a version until you change it, so **hold an offer for the rest of the run** is
  the horizon the name actually describes. This is the reading worth building.
- **C. Locking moves behind the config.** Locking stops being free-to-access from gate 2
  and requires yarn.lock in the pipeline. This takes a control away from every build that
  currently has it, and needs a reason better than "it makes the config matter".

## Things any version has to answer

- **The per-use fee.** Charging KB every time you use it is the pattern we rejected for
  configs: bound a strong config with a readable condition, not a fee. Shop controls are
  exempt because they are controls. If yarn.lock is a config that then bills per lock, it
  is on the wrong side of that line. Either the config's draft cost is the price and
  locking is free while it is installed, or this stays a control.
- **WTFPL kills it.** The full-roster license retires the paid shop controls, since every
  offer is available anyway. yarn.lock is dead weight next to it, and the shop should say
  so rather than selling a config that does nothing.
- **Interaction with Rebuild.** A held offer plus a reroll is the combination to check:
  locking one and rebuilding the rest is the strongest use, and the rebuild price ladder
  (4, 8, 16, 32 ...) is what currently keeps it honest.

## Todo

- [x] Decide A, B, or C (C + B hybrid)
- [x] If B: pick the upgrade (extra held offers, or the rest-of-run horizon) and its price (both: unlimited holds, rest-of-run; config 1 slot / 32 KB)
- [x] Resolve the per-use fee question so the config does not bill on use (fee stands: ADR-042 Pillar 3 allows fees on chosen presses; recorded in ADR-054)
- [x] Say what the shop shows while WTFPL is installed (no padlock at all — lockAvailable keeps the shopOffersFullRoster clause)
- [x] Ship the lock glyph either way (terminal padlock IconButton already shipped; it is a real toggle now)

## Decided (2026-09-03, Marciano)

C + B hybrid: locking moves behind the config AND the horizon is the rest of the run (which the code already did — ADR-029's 'next shop' framing was stale). Parameters:
- yarn.lock: economy, 1 slot, 32 KB (standard per-slot price), `locksOffers: true`.
- 16 KB per lock stands. Legal by ADR-042 Pillar 3: a fee on a chosen action (Telemetry/ESLint precedent), never a condition. The bean's per-use-fee objection is answered by that pillar, recorded in the new ADR.
- Unlimited simultaneous locks (MAX_LOCKED_OFFERS deleted); the shelf bounds it, locking everything freezes your own shop.
- New free `unlock-offer` action (release), no refund.
- Locks dissolve when yarn.lock leaves the build (sell/peel), no refund — kills the buy-lock-sell-back trick.
- LOCK_FROM_GATE deleted; gate 1's dex 'lock' unlock goes with it.
- WTFPL still retires locking (shopOffersFullRoster guard stays).

- [x] Domain: locksOffers field, roster entry, lockerFor, lockAvailable rewrite, unlockOffer, dissolve-on-leave (sell/drop/strip)
- [x] Action plumbing: runAction union + SHOP_WRITES + validation schema
- [x] Dex: remove 'lock' gate action
- [x] UI: ShopView lock/release toggle, module screen release, wiring (RunShop, proto-run)
- [x] Specs: shopAction lock describe, viewmodel controls, ShopView, module ShopScreen, gatedex
- [x] Stories: ConfigsInAction yarn.lock, terminal ShopScreen labels
- [x] Docs: new ADR, ADR-029 supersede note, README index, wiki (§2.8, §4.3 roster+parked, §5.2, numbers), CHANGELOG

## Summary of Changes

- **Config**: `yarnLock` in the roster (economy, 1 slot, 32 KB, `locksOffers: true`); `lockerFor`/`locksSurviving` beside the other grant lookups in `build.model.ts`; `effect.model.ts` files it under the `inShop` skip reason.
- **Domain**: `lockAvailable` now requires the locker in the build (WTFPL clause kept); `MAX_LOCKED_OFFERS` and `LOCK_FROM_GATE` deleted; new `unlockOffer` (free, no refund); `sell`/`drop`/`strip` empty `lockedOfferIds` when yarn.lock leaves the build. New `unlock-offer` action in the union, `SHOP_WRITES`, reducer, and `runActionSchema`.
- **Dex**: `GateAction` lost `lock`; gate 1 promises nothing.
- **UI**: terminal padlock is a real toggle (`Lock for 16 KB` / `Release the lock` via `offerLockFor`); module screen gained a `Release lock` badge; `onUnlock` wired in RunShop and proto-run.
- **Specs**: lock describe rewritten around a yarn.lock fixture (12 tests incl. plural locks, release, sell/peel dissolution, WTFPL-with-locker); viewmodel controls tests re-keyed off the build; ShopView + module ShopScreen label/release tests; gatedex/GatesView no-lock assertions; runSnapshot spec's 'unknown config' fixture renamed (yarn-lock is real now).
- **Stories**: `YarnLockHoldsAnOffer` in ConfigsInAction; OffersCanBeKept labels; ConfigsPanel count comment 23 of 33.
- **Docs**: ADR-054 (supersedes ADR-029's Lock, records the Pillar-3 fee ruling); ADR-029 ⚠ note; README index; wiki §2.8/§4.3 (+yarn.lock row, parked collision removed)/§5.2/numbers; CHANGELOG entry.

Verification: lint clean (903 modules), `tsc --noEmit` exit 0 (stories checked via scratchpad tsconfig), 2664 tests pass — only the 8 pre-existing failures (hand.model playtest hack, modern RewardScreen) remain.

Note: DVTD-4xjs still holds the OLD yarn.lock concept (requirement-raise immunity) — name now taken; candidate for scrapping.
