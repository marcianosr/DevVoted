---
# DVTD-rjv4
title: 'Unify rarity palette: modern-theme adopts the collection''s hues'
status: completed
type: task
priority: normal
created_at: 2026-08-27T10:15:25Z
updated_at: 2026-08-27T10:55:05Z
---

Two rarity palettes disagree: legacy ~/ui/rarityColors (collection/unlockables, image 5) says common=cerulean, uncommon=viridian; modern-theme rarity.ts says common=celadon, uncommon=cerulean. Marciano wants the collection's style on config chips (equation, dex, shop). Also fixes celadon-common colliding with the rail's green paid badges. Change RARITY_BORDER/WASH/TEXT/FILL in modern-theme/rarity.ts; update specs asserting old hues.

## Summary of Changes

Realigned modern-theme `rarity.ts` (RARITY_BORDER/WASH/TEXT/FILL) to the collection's palette from `~/ui/rarityColors`: common cerulean, uncommon viridian, rare cinnabar, legendary ring unchanged. Rationale in the token comment: celadon stays out of rarity — on the rail it means online/paid. Ripples: spec hue assertions updated in Dot, Legend, RarityWord, Chip, Entry (modern-theme) and ShopView (common → text-cerulean). Every modern surface (equation chips, shop, dex, pipeline rows/washes) now matches the collection. CHANGELOG entry added.

Verification: lint + depcruise clean, tsc/build clean, 2456 tests pass — only pre-existing red is RewardScreen.spec ×3 (DVTD-9dn0).

**Follow-up (same day):** the equation's rarity chips also rendered a size up (Chip's rarity branch hardcoded Text body while tone chips use meta). Rarity branch now takes the same ChipSize scale, default sm → text-xs — flush with the tone chips and the Dex's ConfigChip (text-xs). Spec added; full suite green (2457, pre-existing RewardScreen ×3).
