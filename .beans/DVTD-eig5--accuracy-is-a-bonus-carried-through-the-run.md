---
# DVTD-eig5
title: Accuracy is a bonus carried through the run
status: in-progress
type: feature
priority: normal
created_at: 2026-10-03T17:59:37Z
updated_at: 2026-10-03T19:25:10Z
---

**What:** The accuracy multiplier grows slowly across the whole run instead of resetting to a ×2 top every gate.

**Why:** A perfect first gate already maxes the multiplier, so accuracy has nowhere to grow; it should take a run to build.

## Done when
- [x] A perfect first gate multiplies by ×1.08, not ×2
- [x] The bonus carries into the next gate and a miss costs only a little
- [ ] A failed gate neither grows nor shrinks the bonus
- [x] The poll screen, prep and gate result state the carried multiplier
- [x] The engine balance guard passes without retuned assertions
- [x] The decision is recorded in an ADR, the wiki and the changelog

## Notes
Supersedes ADR-161 D1. Differs from the carried meter ADR-169 rejected: no cap, committed only on a clear. Rule: delta = 0.2 × share − 0.1 × (1 − share) per gate; multiplier = 1 + bonus. Plan: ~/.claude-work/plans/im-bothered-by-the-piped-rain.md
