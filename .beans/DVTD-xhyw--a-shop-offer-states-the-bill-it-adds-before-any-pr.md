---
# DVTD-xhyw
title: A shop offer states the bill it adds before any press
status: completed
type: feature
created_at: 2026-10-02T17:27:05Z
updated_at: 2026-10-02T17:27:05Z
---

**What:** An offer that would raise the build-space upkeep shows what it adds (↻ +16 KB a gate) beside its price.

**Why:** The new bill only appeared after the first press, so a player could double-press and install past it unread.

## Done when
- [x] A bill-raising offer states the extra upkeep before any press
- [x] An offer that fits the rented rung states no bill
- [x] The armed press still states the full new bill

## Notes
- billBadgesOf in shopScreen.viewmodel.ts; OfferDeal gained upkeepNowKb from view.buildSpace.perGateKb; reuses RECURRING_GLYPH and upkeepLabelOf from upkeep.ts. YAGNI's lost discount counts as a raise.

## Summary of Changes
Saffron bill badge on rung-crossing offers; specs, wiki, CHANGELOG.
