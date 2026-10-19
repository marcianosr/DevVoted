---
# DVTD-mfj0
title: The Dex, profile, shop, incident and config visuals live with their concepts
status: completed
type: task
priority: normal
created_at: 2026-10-16T08:07:10Z
updated_at: 2026-10-16T08:40:11Z
parent: DVTD-5303
---

**What:** The Dex tabs, the profile cards, the shop screen, the incident panels and the config chips move out of the kit to the parts of the game they show.

**Why:** These have the fewest parts depending on them, so they can move first without touching the run screens.

## Done when

- [x] None of these visuals is left in the kit
- [x] Their tests and stories moved with them and pass
- [x] Lint, typecheck and tests are green

## Notes

Targets: collection/dex, account/profile, run/shop, run/incident, run/config. Mapping in the epic.

## Summary of Changes

Done in one scripted pass with the other phases (the runtime-import rule made per-aggregate phases impossible: a part could only leave once nothing left in the kit imported it). Dex tabs to collection/dex, profile parts to account/profile, ShopScreen to run/shop, the incident panels to run/incident, the config parts and their 34 config stories to run/config.
