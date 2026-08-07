---
# DVTD-rgs4
title: 'HUD: explain gates behind an info icon'
status: completed
type: task
priority: normal
created_at: 2026-08-07T08:48:05Z
updated_at: 2026-08-07T08:53:07Z
---

The storage gauge has an 'i' popover explaining the cap; the gate ladder beside it has none, so nothing on the HUD says what a gate is, how you clear it, or what breaking one costs.

Add the same affordance next to the gate name line, mirroring the storage block's markup so the two icons sit at the same height.

## Todo

- [x] Add the gate popover to RunHud's desktop layout
- [x] Cover it in RunHud.spec.tsx
- [x] Run lint, typecheck, tests

## Summary of Changes

- Extracted `HudHint` in `RunHud.ui.tsx`: the ⓘ trigger plus its `Popover`, so the storage and gate hints cannot drift apart. Storage's inline `<p>` became a `Paragraph` on the way past.
- The gate hint sits at the end of the gate block, mirroring how storage's sits at the end of its bar, which puts the two icons at the same height.
- Copy reads its numbers off the props (`pollsPerGate`, `victoryGate`) rather than hardcoding 5 and 12, and the spec asserts that by rendering a 5-poll, gate-11 run.
- Mobile has no hint, matching the storage precedent.

Verified: 1170 tests pass, `npx tsc --noEmit` clean, `npm run lint` clean, checked in the Storybook HUD story.
