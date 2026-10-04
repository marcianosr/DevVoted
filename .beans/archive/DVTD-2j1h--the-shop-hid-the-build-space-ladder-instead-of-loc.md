---
# DVTD-2j1h
title: The shop hid the build space ladder instead of locking it
status: completed
type: bug
priority: normal
created_at: 2026-09-22T07:08:26Z
updated_at: 2026-09-22T07:08:26Z
parent: DVTD-cb52
---

`buildSpacePropsFor` returned `undefined` when `!space.offered`, and
`ShopScreen` renders nothing for an undefined `buildSpace` — so before
`BUILD_SPACE_FROM_GATE` (2) the panel was absent entirely. A player at gate 0 met
`4 of 4 weight · 0 free` with no way to learn that a ladder exists; the one
sentence that explains it (`NEW_RUN_BUILD_NOTE`) is on the new-run screen, read
once, two gates before it is actionable.

Reported from a live playthrough at `gate 0 cleared`.

## Summary of Changes

- `BuildSpace.ui.tsx` — `locked?: string`. The ladder still draws, every rung
  priced and dimmed; the header meta gains a `Tooltip` reading **locked** whose
  popover carries the reason. `buildSpaceLineOf` drops its "before N takes it to
  X" promise while locked, and tells an over-capacity build to **drop**, since
  taking more room is not available to it.
- `shopScreen.viewmodel.ts` — `buildSpacePropsFor` always returns props;
  `buildSpaceLockOf()` names the gates off `BUILD_SPACE_FROM_GATE` and the free
  rung off `BUILD_SPACE_RUNGS` rather than restating either.
- ADR-082 D5 clarified: the *picker* waits for gate 2, not the panel.
- Wiki build-space row and the unreleased CHANGELOG entry updated.

Specs: ShopView's "offers no build space" case inverted to assert the locked
ladder and the reason; three BuildSpace cases for the locked ladder, the line
with no next rung, and the over-capacity line.

Verified: `npm test` 217 files / 3973 passed / 0 failed; `npm run lint` clean;
`npm run build` clean.
