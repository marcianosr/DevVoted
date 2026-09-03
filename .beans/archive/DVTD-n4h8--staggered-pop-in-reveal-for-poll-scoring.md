---
# DVTD-n4h8
title: Staggered pop-in reveal for poll scoring
status: completed
type: feature
priority: normal
created_at: 2026-07-20T20:14:50Z
updated_at: 2026-07-20T20:23:04Z
---

When a poll is answered, the ✓/✕ marks currently repaint all at once. Animate them Balatro-style: each option's badge pops in sequentially, top→bottom, with row color following in step. Gated on prefers-reduced-motion.

## Todo
- [x] Add reveal-pop keyframe to app.css (motion-safe only)
- [x] Add reduced-motion detection (usePrefersReducedMotion hook)
- [x] Wire staggered per-option delay into PollCard.ui.tsx (badge pop + row color)
- [x] Stagger delay function (feel-shaping) 
- [x] Story coverage for the reveal
- [x] Unit test the delay function
- [x] lint + typecheck + build

## Summary of Changes

- `src/ui/hooks/usePrefersReducedMotion.ts` — new reactive hook (SSR-safe, matchMedia-guarded).
- `src/modules/run/presentation/poll/revealTiming.ts` — `revealDelayMs(index, total)` capped-over-window stagger (REVEAL_WINDOW_MS=360) + spec.
- `src/styles/app.css` — `@keyframes reveal-pop` (fade + overshoot scale), disabled under reduced motion.
- `PollCard.ui.tsx` — on reveal, each option gets a per-index delay staggering badge pop (animationDelay + .reveal-pop), row tint, and label color (transitionDelay).
- `PollCard.stories.tsx` — added RevealedMultiple story.

Checks: lint, tsc --noEmit, 824 tests, build all pass. Feel knob (curve) left tunable in revealTiming.ts.
