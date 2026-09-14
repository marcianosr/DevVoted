---
# DVTD-zecb
title: The scoring popover is clipped by the panel it sits in
status: todo
type: bug
priority: normal
created_at: 2026-09-14T13:49:51Z
updated_at: 2026-09-14T13:49:51Z
---

`PollScreen.ui.tsx` puts `<Tooltip><ScoringRule /></Tooltip>` in `PanelV2.Header`'s
`meta` slot. `PANEL_V2_SURFACE` carries `overflow-hidden` (the rounded corners
depend on it), so the absolutely positioned panel is cut off at the surface edge.

Horizontal half: `Tooltip` now takes `align`, so `PollScreen` passing `align="end"`
fixes it — the meta slot is `ml-auto ... justify-end` and the panel still opens
`left-0` from there.

Vertical half: `top-full mt-2 w-72` drops a ~140px panel below a header inside a
~120px panel. Needs the tooltip lifted out of the overflow context or portalled.

Left out of DVTD-xj95: Marciano scoped that one to the popover's copy.
