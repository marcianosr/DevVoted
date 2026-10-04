---
# DVTD-os3a
title: PERFECT is reached at 60% accuracy on the early gates
status: completed
type: bug
priority: normal
created_at: 2026-10-01T14:53:22Z
updated_at: 2026-10-01T16:16:21Z
parent: DVTD-lk20
---

**What:** Three right answers out of five close gates 0 to 3 in PERFECT, and Pallet is decided after its third poll.

**Why:** When the top band needs no excellence, the last polls of an early gate carry no tension and the band names stop meaning anything.

## Done when
- [x] A design call is recorded: early gates stay a tutorial on purpose, or PERFECT asks for more
- [x] If PERFECT asks for more, three right of five no longer reaches it before gate 4
- [x] The balance sim still passes

## Notes
Playtest 2026-10-01, build .css + IndexedDB + Build Artifacts (+ .ts from gate 1): Pallet 4/5 → PERFECT (meter full after poll 3); Boulder 3/5 → PERFECT; Cascade retry 3/5 → PERFECT; Thunder 3/5 → HEALTHY live, PERFECT at the close; Lavender 3/5 → HEALTHY.
Cause: the codebase is 3-6 slots early (GATE_RUNGS) while a window yields roughly 4-5 units before the ×2^(accuracy) multiplier, plus the head start.
Compounded by DVTD-y1hw: with the bonus unpaid, PERFECT and HEALTHY pay the same. Game-design call, so draft; consider the game-designer agent.

## Summary of Changes

Design call (Marciano, 2026-10-01): PERFECT asks for more. ADR-161 §6 sets the early codebase to 9 changes (9, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11). On a pool spread over five categories, gate 0-3 PERFECT on three right or fewer fell from 27% to 0% for a lean build, 52% to 31% for ×2 and 62% to 35% for ×3: a multiplier build still reaches it on three, which is what the build buys. The engine balance guard in `runAction.model.spec.ts` (now on a spread pool) passes 6 of 6. The unpaid PERFECT bonus stays with DVTD-y1hw.
