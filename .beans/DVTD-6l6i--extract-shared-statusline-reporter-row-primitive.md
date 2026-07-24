---
# DVTD-6l6i
title: Extract shared StatusLine reporter-row primitive
status: completed
type: task
priority: normal
created_at: 2026-07-24T13:08:13Z
updated_at: 2026-07-24T13:14:01Z
---

Lift the badge+line layout out of PipelineReportRow into a domain-free `src/ui/runs/StatusLine.ui.tsx`, then compose it in PipelineReportRow and AnswerResults' ReporterRow so the reporter row reads identically everywhere.

## Todo
- [x] Create src/ui/runs/StatusLine.ui.tsx (pure layout: badge + leading + line + trailing, as=div|summary, onActivate)
- [x] Refactor PipelineReportRow.ui.tsx to compose StatusLine (public props unchanged)
- [x] Refactor AnswerResults.ui.tsx ReporterRow to use StatusLine as=summary; drop local Badge wrapper
- [x] Add StatusLine.stories.tsx
- [x] Add StatusLine.spec.tsx
- [x] Verify: AnswerResults.spec green, new spec green, full test + lint + build

## Summary of Changes

Extracted the badge+line reporter row into `src/ui/runs/StatusLine.ui.tsx` (Tier-1, domain-free: only StatusBadge + Paragraph). Slots: `leading` (chip), `line`, `trailing`; `as` for div/summary; `onActivate` folds in the keyboard-activatable (role=button, Enter/Space) behaviour.

- `PipelineReportRow` now composes StatusLine (chip=leading, value+remove=trailing); public props unchanged, so `GateRewardReport` and `RoleList` needed no edits.
- `AnswerResults` `ReporterRow` uses `StatusLine as="summary"`; dropped its local `Badge` wrapper.
- Added `StatusLine.stories.tsx` + `StatusLine.spec.tsx` (7 tests).

All classNames preserved => identical DOM. Verify: StatusLine.spec + AnswerResults.spec green (15 tests), `tsc --noEmit` 0 errors, `npm run lint` clean (arch boundaries OK). Pre-existing failures at HEAD (RunHud.spec x2, RewardScreen.spec x1) are unrelated branch breakage — confirmed by stashing to HEAD and reproducing them.
