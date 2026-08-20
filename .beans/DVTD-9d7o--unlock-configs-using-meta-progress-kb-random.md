---
# DVTD-9d7o
title: Unlock configs using meta-progress KB (random)
status: todo
type: feature
priority: normal
tags:
    - meta-progress
created_at: 2026-07-23T13:37:05Z
updated_at: 2026-08-20T09:20:51Z
parent: DVTD-z2r2
---

Spend vault KB between runs to unlock a random config you do not own yet. Rival trigger to DVTD-2try (gates/coverage) and DVTD-yuwi (lifetime stats).

- Cost by rarity: common 50KB, uncommon 150KB, rare 300KB, legendary 500KB
- Only unowned configs offered, weighted by rarity, odds shown
- Pity: guaranteed legendary after N pulls
- Needs vault KB balance, owned-config list, pull history

Cap and grant edge cases are settled in ADR-015: one-shot grant configs are strip fodder, grants clip at the cap (clip shown in the shop), cap-extenders use a soft over-cap on removal, and not selling is recorded as deliberate.
