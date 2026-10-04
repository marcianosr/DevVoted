---
# DVTD-ccax
title: Warn at the Install press when an install extends the build
status: completed
type: task
priority: normal
created_at: 2026-10-04T08:54:03Z
updated_at: 2026-10-04T09:29:58Z
---

**What:** Pressing Install on an offer that grows the build rings the card in saffron and asks first in a ledger of growth, price and upkeep, while the storage bar previews the config landing.

**Why:** The old panel sat under the card's far edge in two terse lines, away from the right-aligned press it belongs to.

## Done when
- [x] The armed card states that the build does not fit, how far it grows, what it costs now and every gate
- [x] The player can install from the ledger or cancel back to one press
- [x] The storage bar draws the armed config hatched where it would land
- [x] Specs, story, wiki and changelog say the new sentence

## Notes
InstallScale copy plus the ConfigChip sheet anchor; the fold clips popups, so the sheet stays beside the card.

## Summary of Changes

InstallScale now renders one saffron sentence (warningOf): extends + billed, extends only when the rung is free, or a raised bill when the rung holds. ConfigChip anchors the arming sheet at sm:right-0 under the right-aligned press (upgrade sheet stays sm:left-0); on phone the sheet spans the bottom. ShopScreen WithPanels story now arms the first affordable offer (the old index 0 was unaffordable and could never arm). Specs: InstallScale, ConfigChip armed install, ShopView arm. Wiki and CHANGELOG updated.

## Round 2 (image #88)

The popup gave way to the mock: InstallScale is now a ledger (Doesn't fit lead, weight from to, pay now, upkeep every gate or free) rendered in a saffron inset after the card's fold, replacing the foot, with a solid primary Install press (hint keeps Confirm installing) and an underlined cancel (ChipInstall.onCancel, shop onArm(undefined)). Bare chips keep the sheet. WeightPreview is now name/slots/held: a hatched saffron segment plus the room left, and one saffron caption that shows even where the bar drops its caption. perGateKb left WeightTrack.
