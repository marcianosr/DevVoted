---
# DVTD-ojau
title: Fold's summary row overflows on narrow screens instead of stacking
status: completed
type: bug
priority: normal
created_at: 2026-09-11T15:22:08Z
updated_at: 2026-09-11T15:28:21Z
---

On a phone the build footer's summary row runs off the right edge: `> Build
15 configs [2 usable] [7 running] [1 off...` is clipped by the viewport.

Two things in `Fold.ui.tsx` cause it:

- `SUMMARY` is `flex` with no `flex-wrap`, so the meta strip cannot move to a
  second line.
- `META` is `shrink-0`, so it holds its max-content width and its own
  `flex-wrap` never engages. The badges cannot wrap among themselves either.

Stack the meta strip under the title below `sm`. Fold is shared with
GateClearScreen, ReviewScreen, GateHoldScreen and AnswerDiff, which have the
same latent overflow, so the fix belongs in Fold rather than BuildFooter.

## Todo

- [x] Fold SUMMARY gains flex-wrap
- [x] Fold META drops shrink-0, ml-auto becomes sm:ml-auto
- [x] Spec covering the wrap
- [x] lint, typecheck, tests

## Summary of Changes

`Fold.ui.tsx` only:

- `SUMMARY` gained `flex-wrap`, so the meta strip drops to a second line.
- `META` went from `ml-auto flex shrink-0 flex-wrap ...` to
  `flex flex-wrap ... sm:ml-auto`. Dropping `shrink-0` is the half that actually
  fixes it: the strip was pinned at max-content width, so its own `flex-wrap`
  could never engage and the badges had nowhere to go. `sm:ml-auto` keeps the
  right-alignment on desktop without shoving a wrapped strip to the right edge
  on a phone.

Fixes the same latent overflow in GateClearScreen, ReviewScreen, GateHoldScreen
and AnswerDiff, which all share `Fold`.

Two specs added to `Fold.spec.tsx`. Verified: 4401 passed, 0 TS errors,
depcruise clean.
