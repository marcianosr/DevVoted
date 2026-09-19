---
# DVTD-3mvs
title: 'Kanto theme: full palette screen themes + storybook'
status: completed
type: feature
priority: normal
created_at: 2026-09-08T18:27:42Z
updated_at: 2026-09-08T18:38:34Z
---

New src/ui/kanto-theme kit. Screen keyed on Kanto colour names (data-screen-theme), all 12 palette entries supported in app.css, with stories.

- [x] Extend [data-screen-theme] in app.css from 2 to all 12 Kanto colours
- [x] colors.ts: KANTO_COLORS list + KantoColor type
- [x] Screen.ui.tsx: real component (stub was non-returning, no imports, wrong suffix)
- [x] Screen.stories.tsx with a full-palette story
- [x] lint + typecheck + tests

## Summary of Changes

- app.css: `[data-screen-theme]` extended from 2 entries (cinnabar, celadon) to all 12 Kanto colours, each with a ground-chroma mirroring the gate table. indigo lightened like `[data-gate-theme="elite"]`. Existing cinnabar/celadon declarations left byte-identical — no regression to mood screens.
- `src/ui/kanto-theme/colors.ts`: KANTO_COLORS + KantoColor (the colour axis, distinct from SwatchTheme's badge axis).
- `src/ui/kanto-theme/Screen.ui.tsx`: replaced the non-returning stub. Pure, no hooks, paints its own ground with bg-theme-faint.
- `src/ui/kanto-theme/Screen.stories.tsx`: Default/Narrow/Wide/Palette/MoodPair.
- `src/ui/kanto-theme/Screen.spec.tsx`: 28 tests, incl. one asserting app.css declares a rule for every KANTO_COLORS entry so the list and the table cannot drift.

Verified: oxlint + depcruise clean, tsc clean (incl. a scratchpad config that typechecks the stories), 195 files / 3399 tests pass.

## Deferred

- `Typography.tsx` (Marciano's parallel WIP) has the same non-returning-arrow bug the Screen stub had: `Title` renders nothing.
- `npm run build-storybook` fails repo-wide (rolldown "multiple entries detected"), pre-existing.
- `bg-theme/50` is inert; fix is a `@theme inline` token — not applied, needs a call on deleting the hand-written utilities.
