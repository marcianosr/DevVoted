---
# DVTD-7lbt
title: 'Dev rig on /proto-run: auto-answer to test gates until game-over'
status: completed
type: task
priority: normal
created_at: 2026-07-31T14:13:21Z
updated_at: 2026-07-31T14:20:20Z
---

/proto-run already runs the full game client-side with mocked RunPoll[] (no DB). Gap: testing later gates / game-over manually means answering 20+ polls by hand.

Add a dev-only rig to the proto route:

- [x] Guard route to local dev only (redirect in PROD)
- [x] Single-step buttons: answer current poll right / wrong (uses unredacted state.polls, which only exists client-side on the proto route)
- [x] Fast-forward buttons: auto-answer the rest of the window right / wrong so gates and game-over are reachable in a few clicks
- [x] Verify: typecheck, lint, drive a run to game-over in the browser

## Summary of Changes

All in src/routes/proto-run.tsx (uncommitted, shown to Marciano):

- beforeLoad redirects to / on PROD builds — the rig cheats, so the route is dev-only now.
- Swapped useReducer for useState + a dispatch wrapper so fast-forward can fold runReducer over intermediate states.
- rigOptionIds(poll, outcome) picks correct/wrong option ids from the unredacted RunPoll (only available client-side on this route).
- DEV RIG bar during answering: single-step right/wrong + fast-forward the remaining window right/wrong (loop exits when the reducer leaves the answering status).

Verified: tsc clean, oxlint clean, and drove a full run in the browser — gate 1 cleared via fast-forward, then failed gate 2 repeatedly (strip loop) until the bare build broke (dead state, results screen with 20% meta banking).
