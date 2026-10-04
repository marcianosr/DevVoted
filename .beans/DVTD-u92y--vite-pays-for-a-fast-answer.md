---
# DVTD-u92y
title: Vite pays for a fast answer
status: completed
type: feature
priority: normal
created_at: 2026-10-01T19:13:40Z
updated_at: 2026-10-01T19:17:07Z
---

**What:** A 2-weight config: a correct answer within 15 seconds earns ×1.5 coverage, a slower one ×0.75.

**Why:** Speed as a chosen risk, never a rule everyone has to play.

## Done when

- [x] A fast correct answer earns ×1.5 and a slow one ×0.75
- [x] An answer without a time earns ×1
- [x] It never touches the accuracy multiplier
- [x] It unlocks after 25 correct answers within 15 seconds
- [x] The poll screen shows how long ×1.5 still pays

## Notes

ADR-169. Config fields fastAnswerWithinMs, fastCoverageMultiplier, slowCoverageMultiplier read in effectOf; AnswerContext carries elapsedMs. New metric "fast-correct". The time is browser-reported (as for 408), fakeable by a modified client: fine solo, must be server-minted before any board ranks speed. The poll screen badges a clock in the meta row (pollClockFor): Vite's window counts down ("Vite ×1.5 · 12s", then "Vite ×0.75"), and a 408 limit, which had no visible clock before, counts down ahead of it.

## Summary of Changes

Built as listed; payout specs cover 14s, 15s, 16s and no time.
