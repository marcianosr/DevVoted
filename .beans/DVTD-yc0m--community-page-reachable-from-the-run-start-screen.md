---
# DVTD-yc0m
title: Community page reachable from the run start screen
status: todo
type: task
created_at: 2026-08-25T11:45:44Z
updated_at: 2026-08-25T11:45:44Z
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

- [ ] Add the entry point to the start screen
- [ ] Pick the label and its weight relative to Start run
- [ ] Verify the return path for a not-yet-started run and a finished run
- [ ] Keep community out of `RUN_ROUTES` (target only, never policed)
