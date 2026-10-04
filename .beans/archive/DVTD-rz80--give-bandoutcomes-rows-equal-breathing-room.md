---
# DVTD-rz80
title: Give BandOutcomes rows equal breathing room
status: completed
type: task
priority: normal
created_at: 2026-09-13T13:53:39Z
updated_at: 2026-09-16T18:55:30Z
---

The staged BandOutcomes edit stripped py-3/gap-4 from ROW, so outcome rows now hug the dividers and read as uneven blocks. Restore even vertical padding and the column gap so every row gets the same space.

## Summary of Changes

Closed 2026-09-16: the defect is gone, but by migration rather than by the edit
this bean asked for.

`BandOutcomes.ui.tsx` no longer owns a `ROW` constant at all. It renders
`Panel.Row`, and every outcome row therefore takes one shared constant
(`Panel.ui.tsx:21`):

    "flex w-full items-center gap-3 border-t border-theme-faint px-4 py-2 first:border-t-0"

So the stated bug is fixed: rows have even vertical padding and a column gap, and
the spacing cannot drift between rows because there is only one source. The only
per-row variance left is the danger row's `border-l-2 border-theme`, which
carries no spacing token and so cannot collide with the row class (this repo has
no tailwind-merge).

**The values are the panel primitive's `py-2`/`gap-3`, not the `py-3`/`gap-4`
this bean names.** Restoring those now would either re-add a component-level
override, reversing the PanelV2 consolidation, or move every panel row in the
app. If the roomier spacing is still wanted it is a question about `Panel.Row`
app-wide, not about this table.

No spec pins the row spacing for BandOutcomes specifically; the generic coverage
is `Panel.spec.tsx:109`.
