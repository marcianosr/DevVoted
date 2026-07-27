---
# DVTD-g8ty
title: Collect Swatches
status: draft
type: feature
priority: normal
created_at: 2026-07-13T15:36:26Z
updated_at: 2026-07-27T14:16:47Z
parent: DVTD-d0fw
---

Idea captured, mechanics still TBD, but ties into an existing system: each quiz category already has a fixed Kanto color (`src/ui/theme/categoryTheme.ts`, `app.css` — JS=saffron, CSS=cerulean, etc.).

Rough direction: players collect a "swatch" (color chip) per category, likely tied to mastery/performance in that category (correct answers, best runs, coverage). Collection could live on the dev card / awards surface alongside other social/progression mechanics.

Open questions:
- What triggers earning a swatch — first correct answer in a category? A performance threshold? Full coverage?
- Is this purely cosmetic/collectible, or does it unlock something (config, badge, title)?
- How does it relate to `polls_user_performance` (existing per-category best performance tracking) and `run_category_coverage`?
- Display: dev card grid of swatches (like a palette), profile badge strip, or standalone collection screen?
