---
# DVTD-hsoz
title: Componentize theme-color Swatch chip
status: completed
type: task
created_at: 2026-07-16T07:45:52Z
updated_at: 2026-07-16T07:45:52Z
---

Extracted the recurring 'small rounded chip filled with bg-theme' pattern into src/ui/Swatch.component.tsx (size: sm/md/lg/xl), replacing 6 inline duplicates: CategoryColors.stories.tsx, CategoryWeightsDisplay.component.tsx (also added missing rounding for consistency), RunHud.ui.tsx, CoverageByCategory.ui.tsx, AnswerResults.ui.tsx, PollCard.ui.tsx. Added Swatch.spec.tsx and Swatch.stories.tsx. Excluded the Polldex.component.tsx bg-theme usage — that's a progress-bar fill, not a swatch chip.
