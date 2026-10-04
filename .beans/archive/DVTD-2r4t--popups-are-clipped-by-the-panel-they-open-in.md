---
# DVTD-2r4t
title: Popups are clipped by the panel they open in
status: completed
type: bug
created_at: 2026-09-14T13:11:20Z
updated_at: 2026-09-14T13:11:20Z
---

The scoring-rule popup on the poll screen was being clipped by the panel it sits
in: `PANEL_V2_SURFACE` carried `overflow-hidden`, so an absolutely-positioned
child could not escape.

## Todo

- [x] Drop `overflow-hidden` from PANEL_V2_SURFACE
- [x] Header and Columns round their own corners, which is all the clipping protected
- [x] Tooltip gains `align`, so a right-aligned trigger opens leftwards
- [x] Specs pin both; verified in Storybook across poll, prep, shop, gate outcome

## Summary of Changes

`overflow-hidden` existed so a child's background would respect the root's
`rounded-2xl`. Only two regions have a background: `HEADER` (`bg-theme/5`) and
`COLUMNS` (`bg-theme-raised`). Both now round themselves via `first:rounded-t-2xl`
/ `last:rounded-b-2xl`, so nothing needs clipping and popups escape.

This touches every `PanelV2` and every `Fold` (Fold composes the same surface),
so it was verified visually on the poll, prep, shop and gate outcome screens
rather than on specs alone. No corner regressions: `Body`, `Rows`, `Row` and
`Footer` carry no background, only borders.

`Tooltip` also gained `align` ("start" | "end"). The poll screen's trigger sits
in a right-aligned `meta` region, so once the panel stopped clipping, a
`left-0` panel would simply have hung off the panel's right edge instead. It
passes `align="end"`.

## Verification

Tooltip.spec 6/6, PanelV2.spec 15/15, Fold.spec 13/13. `npm test` 4315 passed, 6
skipped, 2 todo, with only the 2 pre-existing gate.model.spec "floor rule"
failures. `npm run lint` clean, depcruise 0 violations. `npx tsc --noEmit` 0
errors.
