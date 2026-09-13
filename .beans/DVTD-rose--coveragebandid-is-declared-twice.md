---
# DVTD-rose
title: CoverageBandId is declared twice
status: todo
type: task
priority: low
created_at: 2026-09-13T07:31:05Z
updated_at: 2026-09-13T07:31:05Z
---

coverageRatio.model.ts:46 and CoverageBar.ui.tsx:38 both declare `CoverageBandId = perfect|healthy|ok|shaky|danger`. Structurally identical, so nothing needs a cast today, but drift in either breaks silently: the screen would band a reading differently from the model.

Fix: have CoverageBar.ui type-import the domain union. Legal — depcruise allows type-only ui -> modules imports (`ui-stays-presentational` exempts type-only).

Surfaced by DVTD-53bp.

## Todo

- [ ] CoverageBar.ui.tsx imports CoverageBandId from coverageRatio.model as a type
- [ ] Verify depcruise stays clean
