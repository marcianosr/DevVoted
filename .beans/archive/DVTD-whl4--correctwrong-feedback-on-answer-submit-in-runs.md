---
# DVTD-whl4
title: Correct/wrong feedback on answer submit in runs
status: completed
type: feature
priority: normal
created_at: 2026-07-18T08:16:27Z
updated_at: 2026-07-19T08:07:48Z
parent: DVTD-u35m
---

## Story

As a player answering polls in a run, when I click Submit I want to immediately see short feedback telling me whether my answer was correct or wrong, so the result of my answer is clear before the run moves on.

## Why

Right now submitting an answer gives no immediate right/wrong signal. Instant feedback closes the core loop (answer → verdict → consequence) and makes each question feel like it mattered.

## Acceptance criteria

- [x] On submit, a short feedback state appears indicating correct or wrong (e.g. brief banner/flash on the answer screen)
- [x] Feedback is visually distinct: success styling for correct, error styling for wrong
- [x] Feedback appears before/while run effects (streak, multiplier, boost) are applied, not after navigating away
- [x] Works for all active poll/config types in runs
- [x] Feedback is brief — it must not add friction to the answer flow (no extra click required to continue, unless design says otherwise)

## Notes

- Overlaps with the broader juice bean [DVTD-5qxp] (hit/miss feedback, animation, sound) — this story is the minimal correct/wrong verdict only; richer animation/sound stays in DVTD-5qxp.
- UI part lives in Tier 1 (`src/ui/`) with a Story; wiring in run presentation layer (ADR-010).

## Summary of Changes

Verdict banner (Marciano picked this over a reveal-beat pause and a HUD toast, 2026-07-19): after submit the next poll renders immediately and a banner flashes above it for 2.5s — outcome icon/color (viridian/saffron/cinnabar, reused from OutcomeTile) plus the correct answer(s) on a miss. No extra click; `role=status` announces it to screen readers; entrance reuses the `data-screen-transition=slide-up` CSS.

- Tier 1: `presentation/poll/AnswerVerdict.ui.tsx` + stories + spec (owns `VERDICT_DISMISS_MS`, not the timer)
- Pure selector `latestAnswerVerdict(view)` in `runView.viewmodel.ts` (last entry of `answeredThisGate`; tolerates pre-`correct` snapshots) + specs against the real reducer
- Tier 2: `RunGame.component.tsx` sets the verdict only on `answer` dispatches, auto-clears via timeout
- No backend change needed — the dispatch response already carried the outcome

Caveat: the 5th answer of a gate lands on the reward/strip screen, which shows the full answer review instead of the banner — deliberate, not a gap.

## Revision (2026-07-19)

Marciano rejected the banner in review: it shifted the page down and broke on mobile. Replaced with the reveal beat he asked for: on submit the answered poll stays on screen for 2s (ANSWER_REVEAL_MS in RunGame.component.tsx) with PollCard's existing reveal mode — picked options paint green/red, the correct option shows ✓ even if unpicked — then the server result commits to the cache and the run advances. Submit and linter are frozen during the beat. AnswerVerdict.ui (+ story/spec) deleted; latestAnswerVerdict stayed and gained correctOptionIdsFor() to map verdict labels back to option ids on the redacted poll.
