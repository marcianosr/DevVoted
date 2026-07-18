---
# DVTD-whl4
title: Correct/wrong feedback on answer submit in runs
status: todo
type: feature
created_at: 2026-07-18T08:16:27Z
updated_at: 2026-07-18T08:16:27Z
parent: DVTD-u35m
---

## Story

As a player answering polls in a run, when I click Submit I want to immediately see short feedback telling me whether my answer was correct or wrong, so the result of my answer is clear before the run moves on.

## Why

Right now submitting an answer gives no immediate right/wrong signal. Instant feedback closes the core loop (answer → verdict → consequence) and makes each question feel like it mattered.

## Acceptance criteria

- [ ] On submit, a short feedback state appears indicating correct or wrong (e.g. brief banner/flash on the answer screen)
- [ ] Feedback is visually distinct: success styling for correct, error styling for wrong
- [ ] Feedback appears before/while run effects (streak, multiplier, boost) are applied, not after navigating away
- [ ] Works for all active poll/config types in runs
- [ ] Feedback is brief — it must not add friction to the answer flow (no extra click required to continue, unless design says otherwise)

## Notes

- Overlaps with the broader juice bean [DVTD-5qxp] (hit/miss feedback, animation, sound) — this story is the minimal correct/wrong verdict only; richer animation/sound stays in DVTD-5qxp.
- UI part lives in Tier 1 (`src/ui/`) with a Story; wiring in run presentation layer (ADR-010).
