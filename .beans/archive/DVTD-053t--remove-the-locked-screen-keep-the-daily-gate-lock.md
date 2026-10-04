---
# DVTD-053t
title: Remove the locked screen — keep the daily gate lock engine-side
status: completed
type: task
priority: normal
created_at: 2026-07-25T15:48:16Z
updated_at: 2026-07-25T15:50:15Z
---

Marciano: the lock only exists to stop progression, not to be a destination. Remove the /run/locked route, LockedScreen UI (+stories/spec), RunLocked component, the routesForStatus/syncTarget split on isAwaitingTomorrow, RunView.isAwaitingTomorrow/demandRise plumbing, and gate.model requirementRise (built only to feed the screen). Keep the ADR-014 engine mechanic: no exhaustion-win, answer no-op, SEED_LENGTH = SLICE_WINDOW, isAwaitingTomorrow selector + engine specs. Amend ADR-014 consequences + CHANGELOG.

## Summary of Changes

- Deleted RunLocked.component.tsx (Marciano had already deleted LockedScreen.ui/.stories/.spec and src/routes/_authed/run/locked.tsx; routeTree.gen regenerated without the route).
- Restored to HEAD: runRoutes.viewmodel.ts + spec (RUN_ROUTES.locked, the answering/isAwaitingTomorrow split in routesForStatus/syncTarget), gate.model.ts + spec (requirementRise — existed only to feed the screen), runView.viewmodel.ts (RunView.isAwaitingTomorrow, demandRise), runView.factory.ts.
- Kept the ADR-014 engine mechanic untouched: no exhaustion-win, answer no-op without a poll, isAwaitingTomorrow selector + engine/dispatch specs, SEED_LENGTH = SLICE_WINDOW.
- ADR-014 consequences amended: no dedicated locked screen — the lock stops progression, it is not a destination; UI surfacing left open (DVTD-uret).
- CHANGELOG: dropped the 'come back tomorrow screen' phrasing and the Tomorrow's-stakes bullet.
- Beans: DVTD-e6va scrapped, removal note appended to DVTD-go7e.

Verified: oxlint + depcruise clean, tsc clean, vitest 935 passed (3 failures pre-exist on HEAD: RunHud ×2, RewardScreen ×1), production build OK.
