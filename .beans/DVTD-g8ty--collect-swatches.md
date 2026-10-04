---
# DVTD-g8ty
title: Collect Swatches
status: draft
type: feature
priority: normal
created_at: 2026-07-13T15:36:26Z
updated_at: 2026-08-20T09:10:56Z
---

A per-category colour chip earned by mastery in that category. Each category already has a fixed Kanto colour (src/ui/theme/categoryTheme.ts): JS saffron, CSS cerulean, and so on.

Name clash: "swatch" now means gate badge. DVTD-ein1 shipped 12 of them (Pallet through Elite Four), earned by clearing gates and stored on users.owned_swatch_ids. This per-category collectible needs a different name, or scrapping.

Open:
- What earns one: first correct answer in a category, a performance threshold, or full coverage?
- Cosmetic only, or does it unlock something (config, title)?
- Display: dev-card palette grid, profile strip, or its own screen?
