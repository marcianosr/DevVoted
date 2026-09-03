---
# DVTD-esz6
title: 'Config: Cache'
status: in-progress
type: task
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:00Z
updated_at: 2026-09-03T08:09:35Z
parent: DVTD-72d9
---

Repeated category successes more valuable

## Decisions (2026-09-03)

- Scope: whole run — prior correct answers in a category warm it across gates (reads from allAnswered).
- Invalidation: a wrong answer in a category flushes that category's cache to cold.
- Family: amplify. Effect: coverage multiplier on the answered poll's category, scaling with cached hits.

## Todo

- [x] cachedHitsFor in runPoll.model.ts (correct-since-last-wrong per category) + spec
- [ ] Config field cacheHitStep + cacheMultiplierFor curve (Marciano writes the curve) + copy fns
- [x] AnswerContext.cachedHits threaded: effect.model, answer.model, PollView, RevealView (+ modern-theme status.ts skip copy)
- [x] SkipReason cacheCold + row note ("cache is cold here")
- [x] Roster entry (amplify, 4 slots, cacheHitStep 0.25)
- [ ] wiki §4.3 row + CHANGELOG
- [ ] lint / typecheck / tests green
