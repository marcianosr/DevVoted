---
# DVTD-k6zi
title: A gate close plays its outcome before the debrief
status: completed
type: task
priority: normal
created_at: 2026-10-02T17:46:23Z
updated_at: 2026-10-02T18:00:22Z
parent: DVTD-5qxp
---

**What:** When a gate closes, a short reveal plays over the outcome screen: cleared, perfect, shaky, caught or run over, each with its own animation.

**Why:** The close is the run's payoff moment, and it currently lands in silence: no sense of winning, losing or being saved.

## Done when
- [x] Each of the five ways a gate can close plays its own reveal
- [x] The reveal plays once per close; a refresh or a return does not replay it
- [x] A tap or Escape skips straight to the end
- [x] With reduced motion on, the final frame shows at once

## Notes
Source mock: devvoted-outcomes.html (cleared, perfect, shaky, caught, ended).
Overlay over GateOutcomeScreen; kind from revealKindOf in run/gate/domain/outcomeReveal.model.ts; props from outcomeReveal.viewmodel.ts; once-per-close via sessionStorage keyed by run + gate.

## Summary of Changes
- revealKindOf (run/gate/domain/outcomeReveal.model.ts) picks one of five reveals from the close.
- outcomeRevealOf / outcomeRevealFor / outcomeRevealKeyOf in gateOutcome.viewmodel.ts. They live there to reuse the private balance, title and note helpers, so the reveal and the result screen cannot disagree.
- OutcomeReveal.ui.tsx plus useRevealBeats.hook.ts (a timeline of named steps per kind). Keyframes are outcome-* in app.css, and each resting style is the final frame, so reduced motion is free.
- useRevealOnce.hook.ts uses sessionStorage keyed by run number, close count and gate, so a retried gate plays again.
- GateOutcomeView renders the reveal over GateOutcomeScreen. Added stories, specs, a changelog entry and wiki §2.6.
