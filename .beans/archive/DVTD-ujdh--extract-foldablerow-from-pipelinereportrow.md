---
# DVTD-ujdh
title: Extract FoldableRow from PipelineReportRow
status: completed
type: task
priority: normal
created_at: 2026-08-04T15:10:20Z
updated_at: 2026-08-04T15:16:38Z
---

Pull the fold/expand behavior (state, click arbitration, keyboard path, subgrid row shell) out of PipelineReportRow.ui.tsx into a Tier-1 FoldableRow.ui.tsx in src/ui with render-prop summary API. PipelineReportRow keeps content only.

- [x] Create src/ui/FoldableRow.ui.tsx (state, hitsRowControl, subgrid shell)
- [x] Spec: fold toggle, control-click arbitration, onActivate mode, foldable=false
- [x] Story for FoldableRow
- [x] Refactor PipelineReportRow to consume it
- [x] lint + typecheck + tests green

## Summary of Changes

Extracted fold/expand behavior into src/ui/FoldableRow.ui.tsx (Tier 1): fold state, row-click arbitration (hitsRowControl), keyboard path, and the col-span-3 subgrid shell. Render-prop summary(fold) API so the config chip keeps aria-expanded/toggle. Named FoldableRow (not DisclosureRow) to match the fold vocabulary already used in the code. PipelineReportRow is now content-only; ghost mode falls out of onActivate replacing the toggle, shop rows pass foldable = !chipActions. Tidy-up: button role gates on onActivate instead of ghost. 8 new specs, 3 stories. Full suite 1015 passed, lint + tsc clean.
