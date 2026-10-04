---
# DVTD-07v7
title: Links wear the screen theme instead of white
status: completed
type: task
priority: normal
created_at: 2026-09-22T12:21:52Z
updated_at: 2026-09-22T12:25:25Z
---

Link.ui is the kit's one link chrome and paints text-pallet. On a themed screen that reads as a foreign tone. Move it onto the theme text ladder so a link belongs to the screen it sits on.

- [x] Link.ui swaps text-pallet for the themed rung
- [x] Underline follows currentColor so the two can't drift
- [x] Link.spec asserts the themed class
- [x] Doc comment + story prose updated (they argue for white)

## Summary of Changes

`Link.ui` moves off `text-pallet` onto `text-theme-soft` — the middle rung of the theme text ladder, and the same ink `badge-theme` carries, so a link and a badge on one screen read as one tone. Hover climbs to `text-theme-faint`.

The underline drops `decoration-pallet/40` for `decoration-current/40`, deriving from the ink instead of restating it: the two can no longer drift when the theme changes. Verified the class compiles (Tailwind emits `color-mix(in oklab, currentcolor 40%, transparent)`) and that `hover:` attaches to both `@utility` rules.

`Link.stories` gains `AcrossScreens` (four themes side by side) and wraps `InQuietProse` in a `Screen`; a bare story falls back to `:root` cerulean and so could not show the point. `Link.spec` gains a second assertion for the derived underline.

Not touched: `.markdown a` in app.css is still hard-coded cerulean. It is scoped to rendered markdown rather than the kit, so it is a separate call.
