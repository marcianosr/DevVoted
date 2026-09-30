---
# DVTD-cc6f
title: Linter replaces ESLint and Stylelint; the version buys the reset, then the price
status: completed
type: feature
priority: normal
created_at: 2026-09-30T08:53:55Z
updated_at: 2026-09-30T09:20:37Z
parent: DVTD-72d9
---

**What:** One draftable Linter, weight 2, crosses out a wrong answer on any poll. Its fee ladder never resets at v1, resets each gate at v2 and halves at v3.

**Why:** Two category-locked linters were near-identical shelf space, and a linter that reset for free every gate had nothing left for an upgrade to buy.

## Done when
- [x] ESLint and Stylelint are gone from the roster, and Linter holds ESLint's free seat
- [x] At v1 the lint fee carries across a clear and a redo; at v2 it resets each gate; at v3 every rung is halved
- [x] The card states the ladder rule for its version, and one wrong answer always stands
- [x] Existing players hold Linter and no longer hold the two old ids

## Notes

Design settled 2026-09-29 (ADR-158). Supersedes DVTD-w1zu's per-gate reset (now v2's product) and DVTD-e0u5's 32 KB Linter ladder. The ladder is 8/16/32/64/128/256 KB; v3 reads 4/8/16/32/64/128. 402's ×2 and the 429 per-window allowance are unchanged. Under 510 a Linter reads as v1 for the gate.

## Summary of Changes

Roster: `eslint` and `stylelint` deleted; `linter` (weight 2, maxLevel 3, every category via `CATEGORY_CODES`) appended, in STARTER_POOL and CONFIG_UNLOCKS as free. `lintFeeFor` reads `lintsThisRun` (new optional RunState field) at v1 and `window.linted` from v2, times `lintFeeFactorOf` (0.5 at v3), times the audit multiplier; `spendLint` bumps both counters. Copy derives per version and says any poll. Test fillers moved from eslint to html because a 2-slot filler silently fails to install in a four-slot `started()` build. Migration `20260930090000_linter_replaces_eslint_and_stylelint.sql` grants linter to every user (carrying ESLint's first-install mark) and deletes the old rows, with a spec. Stories: `Linter.stories.tsx` (v1 carry, v2 reset, v3 half price), Stylelint stories deleted. ADR-158 D3; DVTD-e0u5 flagged.
