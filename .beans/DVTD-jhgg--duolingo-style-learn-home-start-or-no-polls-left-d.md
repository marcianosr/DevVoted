---
# DVTD-jhgg
title: A home screen to land on, and to land back on when polls run out
status: todo
type: story
priority: normal
created_at: 2026-07-27T11:22:44Z
updated_at: 2026-09-24T12:49:29Z
parent: DVTD-u35m
---

**What:** An always-there home screen: where a player starts, and where they go when today's polls are spent.

**Why:** Running out of polls currently leaves the player on a dead-end screen.

## Done when
- [ ] Decided: landing screen, out-of-polls destination, or both
- [ ] Decided what it shows, and what happens to the routes it overlaps
- [ ] A player with no polls left lands there instead of a dead end

## Notes

Introduce a `/learn` screen modeled on Duolingo's home path — a visual, always-there hub. Two ways it could land in the flow:

1. **Start there.** New/returning players land on `/learn` first instead of going straight into a poll.
2. **End there.** At minimum, once a player has answered everything currently available (the existing `waiting` run state — see DVTD-8), `/learn` becomes the destination instead of a dead-end "nothing to do" screen.

Either way, this gives the "waiting" state somewhere purposeful to send the player, rather than just idling on the last poll/results screen.

## Open questions

- Start-screen or waiting-state destination, or both?
- What does `/learn` actually show — a path/map of categories, progress, upcoming content, cosmetics? Or is it just a richer version of the current waiting state?
- How does this relate to the existing `/pipelines`, `/progress`, and `/community` routes — does `/learn` replace one of them, sit alongside, or become the new default landing route?
- Does this apply per-day (waiting for tomorrow's poll) or only in true "no content left" edge cases?

## Todos

- Decide start-vs-waiting-state scope (or both) before designing the screen
- Sketch what `/learn` shows relative to existing routes
- Identify where the current `waiting` state is handled today and what it shows now
- Prototype `/learn` route
