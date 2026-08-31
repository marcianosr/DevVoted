---
# DVTD-aiyp
title: modern-theme tooltips are invisible on touch
status: todo
type: bug
priority: high
created_at: 2026-08-31T08:29:08Z
updated_at: 2026-08-31T08:29:08Z
---

`src/ui/modern-theme/Tooltip.ui.tsx` reveals only through `group-hover/tip:block` and `group-has-[:focus-visible]/tip:block`. A touch tap fires neither, so every hint on the island is desktop-only.

What is lost on a phone today:
- offer refusal reasons (`Needs 8 slots, 0 free`, `Costs 128 KB, you have 90`)
- the Continue button's exit-lock reason (`shopExitLock`)
- every `Action` hint, `Mark` hint and `SlotMark` hint
- `BuildTrack` cell hints in a gate, which carry the audit that took a config offline
- `PrepScreen`, `StartScreen` and `RemovalScreen` hints

`src/ui/Tooltip.component.tsx` (the legacy global primitive) already solves this: it pins on `pointerType: "touch"`, unpins on outside tap or Escape, and ignores mouse since hover is the mouse's reveal. It is specced in `src/ui/Tooltip.spec.tsx` under "Tooltip on touch".

The catch: it pins on `pointerUp` without swallowing the child's click, so a pressable trigger still fires while the hint appears. Any port has to decide what a tap on a *pressable* hinted element means. DVTD's slot presses solved that separately by arming before they spend.

The island has no hooks in any `.ui.tsx` today — all state is CSS (`details`/`group-open`/`peer`). A touch pin needs either component state or a CSS-only pin, and that choice is the design question here.
