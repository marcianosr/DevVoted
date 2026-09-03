---
# DVTD-w6ma
title: 'Modern theme: config removal screen'
status: completed
type: task
priority: normal
created_at: 2026-08-23T14:07:36Z
updated_at: 2026-08-23T14:12:06Z
---

Storybook-only reskin screen: where a player who missed a gate picks which configs leave the run (ADR-035/037). The destination of RewardScreen's held-branch button.

Mocks 83/84 draw bordered cards; decided instead to reuse the current pipeline look (borderless rows in a Fold) with a cinnabar wash + struck name on a ticked row.

- [x] Pick.ui.tsx + spec + story — tickable pipeline row (Row as="label" + checkbox)
- [x] Tooltip.ui.tsx stops injecting its own trigger button; Mark supplies its own
- [x] RewardScreen: peelCount -> removeCount, onChoosePeel -> onChooseRemoval
- [x] screens/RemovalScreen.ui.tsx + spec + story (Modern/Screens/Removal)
- [x] Disabled continue button carries a tooltip naming the gap in either direction
- [x] Verify: tsc, stories typecheck, vitest, lint, built-CSS grep for new classes

## Summary of Changes

New `Pick.ui.tsx` (tickable pipeline row: `Row as="label"` + checkbox, cinnabar wash and struck name driven by the `checked` prop) and `screens/RemovalScreen.ui.tsx` (`Modern/Screens/Removal`, 4 stories, 12 specs).

`Tooltip` no longer injects its own trigger button — it is now just the `group/tip` shell plus the panel, so it can decorate an already-interactive child. That is what lets a `disabled` Action carry a hint: the hover is read off the wrapper, which stays live. `Mark` renders its own labelled button when hinted.

RewardScreen: `peelCount` → `removeCount`, `onChoosePeel` → `onChooseRemoval`. Rename kept to `src/ui/modern-theme/` by decision; `src/modules/run/`, ADR-035/037 and the wiki still say peel.
