---
# DVTD-yc0m
title: Community page reachable from the run start screen
status: completed
type: task
priority: normal
created_at: 2026-08-25T11:45:44Z
updated_at: 2026-08-25T20:47:26Z
parent: DVTD-cb52
---

The community page should be reachable from the run start screen.

## Where it stands today

- The route exists: `/run/community` (`src/routes/_authed/run_.community.tsx`), rendering
  the climb map, standouts and the board.
- It is deliberately **not** in `RUN_ROUTES`. The comment says why: "the community board is
  a breather outside the climb, so the sync must never police it — it is only ever a
  target." Keep that. This bean adds entry points, it does not put community under route
  sync.
- Exactly one in-app link points at it today: a nav action on the prep screen
  (`RunPrep.component.tsx:50`). The only other way in is the automatic redirect
  `syncTarget` performs for `awaitingTomorrow` players.
- So a player who has not started a run, or whose run just ended, has no way to reach it
  without typing the URL.

## What to add

- **Run start screen.** An entry point next to starting the run. This is the screen a
  player lands on when they open the game with nothing in progress, and "what did everyone
  else do today" is a reasonable first question, not only a mid-run breather.
- **Game over screen.** Covered by DVTD-6vw2, which now has the community page as its
  decided primary action.

## Questions

- Same affordance on both screens, or does start get something quieter than game over's
  primary action? Start is a screen with one job (begin the run), so a second loud button
  competes with it.
- Does it read as "Community", or as what it actually shows today ("Climb today")? The
  board is day-scoped, and the more specific label is the more useful one.
- Coming back: from community there is a route back into the run, but check it lands
  correctly for a player who has not started one yet.

## Todo

- [x] Add the entry point to the start screen
- [x] Pick the label and its weight relative to Start run
- [x] Verify the return path for a not-yet-started run and a finished run
- [x] Keep community out of `RUN_ROUTES` (target only, never policed)

## Summary of Changes

**Entry point.** `RunStart.component.tsx` gained a `leftAction`: `← Community`. Quiet by construction — the legacy `Screen` puts `leftAction` in the footer's left slot, so it cannot compete with `Start today's climb →` on the right. Same left/right grammar the prep screen already uses (`← Back to shop` / `Community →`).

**Label: "Community", not "Climb today".** Two reasons. Prep already says Community, and coining a second word for one destination is the thing to avoid. And `RunStart`'s own `<Title>` is literally "Today's climb" — a button on that screen reading "Climb today" that navigates away would be actively misleading.

**Return path — one real defect found, one flash removed.** `RunCommunity` hardcoded `label: "Back to your run →"` and `backTarget = status === "rewarding" ? "/run/prep" : "/run"`.
- With no run started, that button claimed a run that does not exist. It now reads `Today's climb →`.
- A finished run went to `/run`, which `syncTarget` then bounced to `/run/over` — the start screen flashed on the way. Same for `answering`, which bounced to prep or answer.

Both are fixed by `returnFromCommunity(view)` in `runRoutes.viewmodel.ts`, which returns `{ path, label }` off the same status table `syncTarget` reads, so the two cannot disagree. `rewarding` keeps its override to prep: the first allowed screen there is the payout celebration, already spent.

A spec asserts the invariant directly — for every status, `syncTarget(returnFromCommunity(view).path, view, false)` is null, i.e. the page it sends you to is one the sync would leave alone.

Community stays out of `RUN_ROUTES`; nothing about the sync changed.

**Not done here:** the game-over entry point, which this bean assigns to DVTD-6vw2.

Verification: tsc clean, lint + dependency-cruiser clean, 2384 tests pass (6 new). The 3 `RewardScreen.spec.tsx` failures are pre-existing on this branch.
