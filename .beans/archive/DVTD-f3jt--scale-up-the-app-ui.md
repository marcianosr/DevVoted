---
# DVTD-f3jt
title: Scale up the app UI
status: completed
type: task
priority: normal
created_at: 2026-09-07T10:44:28Z
updated_at: 2026-09-07T10:46:13Z
---

Bump the app's visual scale ~1.5x to match the zoomed-in mock, without a layout refactor. Root font-size drives rem-based type/spacing; hardcoded px caps must move to rem or they won't scale.

- [x] Set root font-size in src/styles/app.css
- [x] Convert Panel.ui.tsx px max-widths to rem
- [x] Verify lint + typecheck + tests

## Summary of Changes

- `src/styles/app.css`: `html { font-size: 150% }` in `@layer base`. A percentage rather than px, so a visitor who has raised their browser font-size still gets it multiplied.
- `src/ui/terminal-theme/Panel.ui.tsx`: `max-w-[850px]` to `max-w-[53.125rem]`, `max-w-[1120px]` to `max-w-[70rem]`. Identical at a 16px root, but they now follow the root instead of caging the scaled type.

Verified: lint clean (963 modules, 0 dependency violations), `tsc --noEmit` clean, 3790/3801 tests pass. The 3 failures in `src/ui/modern-theme/screens/RewardScreen.spec.tsx` pre-date this change (confirmed by re-running that spec with both files stashed).

Deferred: `text-[10px]` / `text-[9px]` in AvatarChip, Choice, ClimbTrack, AnswerResults, ClimbToday, Avatar and `min-w-[320px]` in Dropdown stay pinned at 16px-root sizes, so they read relatively smaller now. `text-xxs` (0.625rem) already exists for exactly this.
