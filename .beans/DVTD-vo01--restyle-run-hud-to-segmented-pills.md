---
# DVTD-vo01
title: Restyle run HUD to segmented pills
status: scrapped
type: task
priority: normal
created_at: 2026-07-15T11:13:50Z
updated_at: 2026-07-15T11:39:30Z
---

Restyle RunHud.ui.tsx so each stat (Storage, Gate, polls-to-clear, Coverage) renders as a distinct rounded pill/chip with its own subtle background. Kanto palette. Presentational-only change in src/modules/session-run/presentation/run/RunHud.ui.tsx.

## Reasons for Scrapping

Pivoted away from the segmented-pills restyle mid-work. User instead wanted a minimal change: coverage %% value switched from text-cerulean to text-white in RunHud.ui.tsx. Chip changes fully reverted.
