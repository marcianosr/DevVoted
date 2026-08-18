# ADR-034: The gate is a CI run: passing demands a coverage total

## Status

Accepted (2026-08-15, Marciano). **Reverses [ADR-019](019-depth-and-width-are-independent.md)
Decision 2** (gates grant slots), **supersedes [ADR-008](008-reward-shop-multibuy-coverage-gated-slots.md)'s
coverage slot ladder**, **amends [ADR-013](013-gate-scaled-coverage.md)** (loss
ratio 0.5 → 0.25) and **[ADR-027](027-gate-width-demand.md) Decision 2** (a shop
now sits between a strip and its replay). Work tracked in DVTD-wlte.

> ⚠ Amended by [ADR-035](035-gates-are-auditors.md) (2026-08-17): Decisions 1, 3 and 6 reversed — the demand is per-gate and fresh, the table reprices, the laps display is gone. Decision 2's strip-shop-replay loop narrows to strip audits; Decision 5 (gates grant slots) stands.

## Context

Coverage was the score, but no gate ever asked for it. A build could ignore
coverage and still pass every gate on its checks alone. In the fiction the gate
is the judgement (CONTEXT.md), and a CI run that never reads the coverage
report is a strange CI run.

## Decision

### 1. A gate demands a coverage total

To pass: every check passes **and** the run's total coverage meets the gate's
threshold. Falling short fails the gate exactly like a failed check: strips,
then the same gate again.

### 2. A redo goes through the shop

Fail → strip → **shop** → prep → replay. KB is the comeback resource: rebuy
what the strips took. Camping is already priced: the bill collects on every
window (ADR-023) and only the passing attempt pays the reward. This reverses
ADR-027's "no shop sits between a strip and its replay", so ADR-031's blocked
exit now grades replays too.

### 3. Thresholds: 80% of a perfect base pace

Perfect base pace through gate `g` is `5·(g+1)(g+2)/2`. The threshold is 80%
of that, rounded:

| Gate | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Coverage | 3% | 12% | 24% | 40% | 60% | 85% | 110% | 145% | 180% | 220% | 265% | 310% | 365% |

The rule is the contract; the rows live-tune in `rules.model.ts`
(`coverageDemandFor`). Thresholds use the raw base, so streaks and config
multipliers are bonus, never homework. Gate 0 rounds down so a 4-of-5 teaching
window still passes.

### 4. Wrong answers bleed less: 0.25, was 0.5

ADR-013's gate scaling stays; only the constant halves. Break-even accuracy
drops from 33% to 20%. Reason: a miss now also risks a redo, so the direct
bleed can soften. Above 20% accuracy every window nets progress, so a redo
always grinds toward the threshold while strips and bills price the attempts.
Death stays with the build (ADR-021), never with the score.

### 5. Gates grant slots

Clearing gates 1–11 grants slots 4–14; gate 0 teaches on the starting three.
The coverage slot ladder (`SLOT_COVERAGE_GATE`) is deleted; ADR-025's
auto-claim stays, keyed to the clear. This reverses ADR-019 Decision 2 in the
safe direction: ADR-018 died because slots opened gates (farmable, stallable).
Here gates grant slots, so there is nothing to farm. And with coverage now the
gate's own demand, a second coverage ladder would price the same thing twice.

### 6. Coverage shows in laps of 100%

L1 **Line**, L2 **Branch**, L3 **Mutation**, L4 **Fuzz**. "Branch 70%" is 170%
total. "Lap" gets a CONTEXT.md entry with the implementing commit.

### 7. Checks: one retarget

`coverageGain`'s "+1% this window" is auto-met once every build chases
coverage; retarget it (open question below). `intellisense`'s "coverage in 2
categories" check keeps its bite: spread is still a choice.

## Rejected: die-by-score

A steeper coverage decline plus a collapse floor, so a camped gate could bleed
a run to zero. Rejected: it retunes every number in the game, punishes the
score for a build failure, and death stops being legible at the gate (ADR-021).

## Open questions

1. Polls run out while camping a gate. Default: the prep countdown (ADR-032)
   holds the replay for tomorrow. Marciano: "not sure" (2026-08-15).
2. How to retarget `coverageGain`: scale with the gate, or swap the check.
3. Gate 0: keep the 3%, or exempt the teaching gate.

## Consequences

- Width is deterministic now (slots = gate + 2, capped at 14) and always covers
  the width demand (max 8). Scarcity moves entirely to KB: the game is
  affording configs, not earning room for them.
- Wiki §2.10 drops from three staging axes to two: gate number and category
  coverage. The total-coverage axis is gone.
- The threshold table assumes ADR-013's `(g+1)%` base gain per correct. Change
  that curve and this table retunes in the same commit.
