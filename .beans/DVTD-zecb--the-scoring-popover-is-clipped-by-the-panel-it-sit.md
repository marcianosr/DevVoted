---
# DVTD-zecb
title: The scoring popover is clipped by the panel it sits in
status: todo
type: bug
priority: normal
created_at: 2026-09-14T13:49:51Z
updated_at: 2026-09-14T20:10:26Z
---

`PollScreen.ui.tsx` puts `<Tooltip><ScoringRule /></Tooltip>` in `Panel.Header`'s
`meta` slot. `PANEL_V2_SURFACE` carries `overflow-hidden` (the rounded corners
depend on it), so the absolutely positioned panel is cut off at the surface edge.

Horizontal half: `Tooltip` now takes `align`, so `PollScreen` passing `align="end"`
fixes it — the meta slot is `ml-auto ... justify-end` and the panel still opens
`left-0` from there.

Vertical half: `top-full mt-2 w-72` drops a ~140px panel below a header inside a
~120px panel. Needs the tooltip lifted out of the overflow context or portalled.

Left out of DVTD-xj95: Marciano scoped that one to the popover's copy.

## Premise is now stale (DVTD-khtk)

Both halves have moved since this was written.

- **The overflow context is gone.** DVTD-52ia merged PanelV2 into `Panel` and
  dropped `overflow-hidden` from the surface; `Panel.spec.tsx:18-30` now pins its
  absence ("lets a popup escape"). Nothing on the poll screen's ancestor chain
  clips.
- **The panel shrank.** `ScoringRule` is a two-row table now, roughly 80px against
  the ~140px of prose this bean measured, and `Tooltip` gained `width="wide"` so
  the rows do not wrap on a normal viewport.

Not closed: neither change was seen in a browser. chrome-devtools MCP is held by a
stale profile and the claude-in-chrome extension is disconnected. Worth one look on
a narrow viewport, where the wide panel is the remaining risk, and closing on the
spot if it sits clear.
