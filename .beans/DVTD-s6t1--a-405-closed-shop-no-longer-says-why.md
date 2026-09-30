---
# DVTD-s6t1
title: A 405-closed shop no longer says why
status: completed
type: bug
priority: normal
created_at: 2026-09-14T12:11:10Z
updated_at: 2026-09-29T19:03:12Z
---

DVTD-b6b0 dropped the registry's note from the shop by request. That note carried
two strings, and one of them was the only explanation a live player ever got for
a shop closed by a 405 audit: "an audit has the shop read-only this gate".

`ShopView.component.tsx` never passes `audits` to `ShopScreen`, so the 405 alert
band that the fixtures show (`kantoClosedShopProps`) does not exist in the
running app. A closed shop is now a screen of dead buttons with nothing saying
why they are dead.

The screen already renders an audit band; nothing needs designing. The fix is to
pass the closing audit into it.

## Todo

- [ ] ShopView passes the read-only audit into `audits` when `shopControls.shopLocked`
- [ ] A spec covers the closed shop naming its audit

## Summary of Changes

Closed by DVTD-euw1 / ADR-157. `ShopView.component.tsx` now passes the gate's
live audits to `ShopScreen` through a new `shopAuditsFor`, so a 405-closed shop
draws the audit that shut it above the dead presses. The incident desk's two
`shopClosed` refusals were also split, so a shop shut by an audit and a desk
that is not dealing no longer share one sentence, and 405's own description now
names the incident desk among what it blocks.
