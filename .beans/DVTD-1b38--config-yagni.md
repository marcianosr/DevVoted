---
# DVTD-1b38
title: 'Config: YAGNI'
status: completed
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-19T20:36:09Z
updated_at: 2026-09-26T16:25:41Z
parent: DVTD-72d9
---

**What:** A config that takes a set amount off the build-space bill for every empty slot in the build.

**Why:** Pays you for not installing things, and it is the first config to touch the bill.

## Done when
- [x] Every empty slot takes 8 KB off the bill the build pays at a gate clear
- [x] The discount never runs past the bill itself, so a free build still pays nothing
- [x] The config fills a slot like any other, so installing it into a full rung raises the bill instead of lowering it
- [x] Every surface that quotes the bill quotes the discounted figure, the arming install press included
- [x] A spec covers zero, one and several empty slots

## Notes

Empty-slot config on the BILL axis (Marciano picked this axis over storage-on-clear,
2026-08-19; Balatro Joker Stencil pattern). Don't install it, don't pay for it — the
truest YAGNI.

Self-balancing late: gates no longer grant slots, but the rungs are coarse, so the
empty half of a wide rung is where the discount is worth most.

Numbers settled 2026-09-26: a flat 8 KB per empty slot, one slot, 32 KB to draft. Flat
rather than a percentage or a pro-rata bill, and 8 rather than more, because 8 is the
largest flat step at which crossing into a wider rung is still a loss. Above about 10
the discount starts paying for the climb, which would invert the whole build economy.

Two earlier claims in this bean were stale and are corrected here. The bill it discounts
is the build-space rent, not the storage subscription — that subscription was deleted
twice and sits in the rejected log. And the config carries no family or rarity, because
the grade ladder was deleted; it carries a size, which is one slot.

## Summary of Changes

Shipped as a one-slot config drafting at 32 KB, unlocking on reaching gate 4 having
never paid upkeep.

The discount is a flat 8 KB per empty slot. Flat rather than pro-rata because a bill
that follows weight in use is the thing the build-space ADR rejected outright, and 8
rather than more because 8 is the largest step at which climbing a rung is still a
loss. Above about 10 the config would start paying for the climb and invert the whole
build economy, so the number is derived rather than chosen.

The config's own slot counts. It eats one of the empties it pays for, and installing it
into a build already flush with its rung tips the build up a rung and raises the bill.
That is the decision it exists to ask, and the arming install press discloses it.

Two claims had to be settled first. The exemption ADR says a per-config term cannot
reach the settlement because it never sees the configs; that is stale, since the
settlement takes the whole build today, and the new ADR amends the sentence. The
build-space ADR's argument against a weight-in-use bill is still live and is answered
by the ceiling on the figure rather than by ignoring it.

One thing grew beyond the original scope, and deliberately. With a per-empty-slot
credit held, an install that lands inside the rung already rented also raises the bill,
which the arming press did not previously fire on. Leaving that silent would have been
the same unreadable-ladder failure that got the growing-streak config deleted, so the
press now arms whenever the bill moves and states the new figure alone when the rung is
unchanged.

Wrote the ADR, added the roster row and the build-space paragraph to the wiki,
regenerated the counted blocks, added a story covering a build low in its rung, flush
with it, and on the free four, and logged the player-facing entry.

Verified: 4060 tests green across 208 files, oxlint and dependency-cruiser clean, wiki
in sync, typecheck clean, prettier clean.
