---
# DVTD-fkr2
title: 'Config: yarn.lock, hold a shop offer'
status: draft
type: feature
created_at: 2026-08-24T15:12:42Z
updated_at: 2026-08-24T15:12:42Z
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

- [ ] Decide A, B, or C
- [ ] If B: pick the upgrade (extra held offers, or the rest-of-run horizon) and its price
- [ ] Resolve the per-use fee question so the config does not bill on use
- [ ] Say what the shop shows while WTFPL is installed
- [ ] Ship the lock glyph either way
