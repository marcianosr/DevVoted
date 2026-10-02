---
# DVTD-6hyy
title: Every gate's scoring table is drawn in one Storybook story
status: completed
type: task
created_at: 2026-10-01T17:17:42Z
updated_at: 2026-10-01T17:17:42Z
---

**What:** One Storybook story draws the Scoring panel for all thirteen gates at once, with every fold opened.

**Why:** The scoring table seals the gates ahead, so reading what a change is worth gate by gate meant opening thirteen separate stories.

## Done when

- [x] Opening the story shows a Scoring panel for every gate from Pallet to Champion
- [x] Each panel wears its gate theme and is labelled with its gate
- [x] The folds arrive open, so the table is readable without thirteen clicks
- [x] Lint and the Scoring spec pass

## Summary of Changes

`EveryGate` added to `Scoring.stories.tsx`, mapping `ALL_SWATCHES` over `kantoScoringAt`. Each panel sits in a `Screen` wearing that gate theme with `floor="0"` so the thirteen pack into a grid.

Scoring renders a `Fold`, which defaults to closed and takes no `open` prop from `Scoring`, so the story opens the folds in a `play` function — the same `setAttribute("open", "")` trick `AppNav.stories.tsx` already uses. No component API was widened for a story.

Reading it back: the per-gate codebase only steps 9 to 10 to 11 across the run, so one covered change moves from +11.11% to +9.09% while the HEALTHY line climbs 40% to 84%. The squeeze is in the line, not in what a change is worth.
