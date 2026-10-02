---
# DVTD-05wl
title: Every gate's stake is drawn in one Storybook story
status: completed
type: task
priority: normal
created_at: 2026-10-01T17:03:44Z
updated_at: 2026-10-01T17:06:02Z
---

**What:** One Storybook story draws the At stake panel for all thirteen gates at once.

**Why:** The ladder, the pays and the peel change gate by gate, and today you can only read them one hand-made fixture at a time.

## Done when

- [x] Opening the story shows a stake panel for every gate from Pallet to Champion
- [x] Each panel wears its own gate theme and names its gate
- [x] Only the gate varies across the panels: the build and the standing are derived the same way for each
- [x] Lint, typecheck and tests pass

## Summary of Changes

One story, `EveryGate`, added to `BandOutcomes.stories.tsx`. It maps `ALL_SWATCHES` and draws `kantoAtStakeAt` for each gate inside a `Screen` wearing that gate theme, with `floor="0"` so the thirteen panels pack into a grid.

The build is the same four configs at every gate and the standing is each gate ladder own OK line, so the only axis that moves is the gate.

Stories are excluded from tsconfig, so the render was verified in Storybook (iframe id `kanto-bandoutcomes--every-gate`): no console errors, thirteen panels drawn.

Reading it back: with this build, from the Thunder gate on, HEALTHY and PERFECT quote the same payout, because landing HEALTHY already takes all five answers and the quote is capped at the window.
