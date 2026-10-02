---
# DVTD-rose
title: CoverageBandId is declared twice
status: completed
type: task
priority: low
created_at: 2026-09-13T07:31:05Z
updated_at: 2026-10-01T15:39:18Z
---

coverageRatio.model.ts:46 and CoverageBar.ui.tsx:38 both declare `CoverageBandId = perfect|healthy|ok|shaky|danger`. Structurally identical, so nothing needs a cast today, but drift in either breaks silently: the screen would band a reading differently from the model.

Fix: have CoverageBar.ui type-import the domain union. Legal — depcruise allows type-only ui -> modules imports (`ui-stays-presentational` exempts type-only).

Surfaced by DVTD-53bp.

## Todo

- [ ] CoverageBar.ui.tsx imports CoverageBandId from coverageRatio.model as a type
- [ ] Verify depcruise stays clean

## Summary of Changes

Closed in the 2026-10-01 stale-bean sweep: the code already does this. CoverageBandId is declared once, in coverageRatio.model.ts; CoverageBar.ui imports the type.
