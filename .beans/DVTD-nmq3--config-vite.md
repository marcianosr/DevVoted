---
# DVTD-nmq3
title: 'Config: Vite'
status: completed
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:00Z
updated_at: 2026-10-02T18:15:37Z
parent: DVTD-72d9
---

**What:** A config that pays a bonus for answering quickly.

**Why:** Rewards speed, which nothing else in the roster does.

## Done when
- [x] The time that counts as fast, and the bonus, are decided
- [x] The config can be drafted and installed
- [x] Answering inside that time pays the bonus, and a spec covers either side of it

## Notes

Fast answers earn bonus rewards

## Summary of Changes

Already shipped under ADR-169; this bean was left open. `CONFIGS.vite` (2 slots): a correct answer within 15s pays ×1.5, a slower one ×0.75. Covered by `answerPayout.model.spec.ts` (`Vite pays for a fast answer`), 14s / 15s / 16s / untimed. Closed during the 2026-10-02 balance playtest.
