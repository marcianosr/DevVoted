---
# DVTD-vhuh
title: Run coverage is one cumulative score for the whole run
status: completed
type: feature
priority: critical
created_at: 2026-09-13T12:56:33Z
updated_at: 2026-09-13T14:01:47Z
---

Replaces the per-gate coverage meter (ADR-073 D4) with one run-wide score:
`banked units / (5 x (gate + 1))`. Every poll ever answered counts.

Plan: ~/.claude-work/plans/help-me-design-devvoted-s-spicy-meteor.md

## Shape

- Every poll has a ceiling of 1 unit, whatever its type (knowledge, not option count)
- Two ledgers: a scoring ledger a retry replaces, and an append-only raw record
- Bands measured in UNITS (OK = -2, floor = -4), not percentage points
- Floor rule: at least 2 of 5 correct, pre-multiplier, or the gate holds
- A flawless gate floors at SHAKY, never fatal
- Surplus above 100% pays KB, never buys coverage back

## Todo

- [x] Units replace percentages in coverageRatio.model.ts
- [x] Re-value HEALTHY_LADDER; retire LOSS_LADDER
- [x] Bands become unit-scaled functions of gate
- [ ] Collapse the three divergent coverage algebras onto effectOf().coverage
- [x] Terminal streak term in coverageForAnswer (+0.1/consecutive, cap +0.4)
- [x] Scoring ledger in RunState; run coverage derived not stored
- [x] gatePassed reads run coverage + flawless floor (floor rule left for Marciano)
- [x] Per-gate streak reset; peel share escalates per attempt
- [x] Code Coverage coverageAdd 0.5 -> 0.1, reword
- [ ] Dependabot reads the shared streak counter
- [ ] Late-shop multiplier ceiling by gate
- [ ] maxReachable so a dead run can be ended honestly
- [ ] Bind-on-reveal for unplayed daily polls
- [ ] New ADR reversing ADR-073 D4 and ADR-013 D2
- [ ] Fix the four off-by-one "twelve gates" doc statements + wiki.md:98-100
- [ ] CHANGELOG
- [ ] Re-derive the Monte Carlo (bare build is no longer walled)

## Bugs found while building

1. **A gate-0 miss cleared the gate.** Two units is 40 points at gate 0 against a 20 point line, so both band drops clamped to zero and `held >= okAt(0)` was `0 >= 0`. OK clears. The old model had the same clamp but never noticed: `gatePassed` compared against HEALTHY directly and the bands were display-only. Routing the bands into the verdict (ADR-076) is what opened it. Fixed asymmetrically: a gate with no room for an OK band collapses OK up onto healthy (no thin clears); a gate with no room for a DANGER band clamps the floor to zero (ADR-057, the calibration gate never kills).

2. **A run sitting exactly on its floor was killed.** `bandAtClose` fed a rounded ladder percentage (61.1) back into `bandFor`, which compares against the unrounded `floorAt(8) = 0.61111`. Fixed by naming the band from the displayed percentages, so the number the player reads and the verdict they get come from one value.

3. **`gateLadderFor` computed the band drops itself** instead of using `okAt`/`floorAt`, so fix 1 never reached it. Two implementations of one rule, diverging. All three lines now derive from the model.

## Verified baseline

HEAD is green (250 files, 4622 tests). Panel.spec's 2 failures are pre-existing WIP, confirmed by running the Panel files alone at HEAD.

Current: 4175 passed, 34 failed.

## Summary of Changes

- `ROW`: `py-3 gap-4` restored, so every row gets the same band of space around its content.
- `ROWS`: `-my-4` cancels Panel's own `py-4`, so the first and last rows sit on the same half-gap the dividers give the middle rows instead of a double one.

Pre-existing and untouched: the staged removal of the `layout` prop is half-done, so `NewRunScreen.ui.tsx:52` and `BandOutcomes.spec.tsx:175` still pass `layout` and `npx tsc --noEmit` fails on both.

## Follow-up (same session)

- Rows tightened to `py-2`: 8px each side, 16px between rows across a divider.
- Added a `band / coverage / outcome / pays` heading row, underlined with `border-b` so the `.border-t` rule count still equals the gaps between outcomes.
- Column widths now live once in `COLUMNS`; the row cell classes are built from it, so the heading cannot drift out of alignment with the rows.

- Dividers now run edge to edge: `ROWS` also cancels the panel's `px-4` with `-mx-4` and each row carries its own `px-4`; `overflow-hidden rounded-2xl` keeps the filled header inside the panel's corners.
- Header wears `bg-theme-raised`, the one opaque step above the panel ground (L 0.22 over L 0.1).
