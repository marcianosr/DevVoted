---
# DVTD-esz6
title: 'Config: Cache'
status: completed
type: task
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:00Z
updated_at: 2026-09-03T08:18:43Z
parent: DVTD-72d9
---

Repeated category successes more valuable

## Decisions (2026-09-03)

- Scope: whole run — prior correct answers in a category warm it across gates (reads from allAnswered).
- Invalidation: a wrong answer in a category flushes that category's cache to cold.
- Family: amplify. Effect: coverage multiplier on the answered poll's category, scaling with cached hits.

## Todo

- [x] cachedHitsFor in runPoll.model.ts (correct-since-last-wrong per category) + spec
- [x] Config field cacheHitStep + cacheMultiplierFor curve (linear capped — Claude wrote it on request) + roster copy
- [x] AnswerContext.cachedHits threaded: effect.model, answer.model, PollView, RevealView (+ modern-theme status.ts skip copy)
- [x] SkipReason cacheCold + row note ("cache is cold here")
- [x] Roster entry (amplify, 4 slots, cacheHitStep 0.25)
- [x] wiki §4.3 row + CHANGELOG
- [x] lint / typecheck / tests green

## Summary of Changes

- `cachedHitsFor(answered, category)` in runPoll.model.ts: a category's correct answers since its last wrong one, whole-run scope from `allAnswered`. Partial answers neither warm nor flush (the `nextStreak` precedent).
- `Config.cacheHitStep` + `cacheHitMultiplier(step, hits) = 1 + step × min(hits, CACHE_HIT_CAP)` with `CACHE_HIT_CAP = 4`; `cacheMultiplierFor` wraps the cold/no-step guards and minified halving. Step 0.25 → ×1.25 per hit up to ×2.
- `AnswerContext.cachedHits` (required) threaded: answer.model reducer, PollView (PollFacts), RevealView (pre-answer via `allAnswered.slice(0, -1)` so the reveal equation shows the multiplier that scored the answer).
- New `SkipReason` \"cacheCold\": terminal row note \"cache is cold here\", modern-theme copy table entry.
- Roster: **Cache**, amplify, 4 slots (128KB), auto-surfaces in drafts.
- Wiki §4.3 shipped row (roster count 30 → 31), CHANGELOG Unreleased entry.
- Proto-run (same session, side request): every rolled shop draft is replaced with the full catalog minus owned, via `withFullCatalog` around the reducer — prototype-only, domain untouched.

Verified: tsc clean, oxlint + dependency-cruiser clean, 2667 tests pass (212 files; +12 new). 3 pre-existing failures in modern-theme RewardScreen.spec.tsx (stale spec vs committed styles work, untouched by this task).

Open design note: wiki §4.3 🟡 still lists `.every()` (+1% on a 5-streaked category) — same repeated-success dial Cache now owns; per the DVTD-72d9 audit one of the two should die.
