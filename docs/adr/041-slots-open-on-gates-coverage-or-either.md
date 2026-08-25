# ADR-041: Slots open on gates, coverage, or either

## Status

Accepted — 2026-08-25 (Marciano, DVTD-tk21). **Reverses
[ADR-034](034-the-gate-is-a-ci-run.md) Decision 5** (gate clears grant every slot)
and lowers the cap it set. Restores a coverage axis of the kind
[ADR-008](008-reward-shop-multibuy-coverage-gated-slots.md) had before ADR-034
deleted it. Width still claims itself with no purchase step
([ADR-025](025-automatic-width-claiming.md)).

## Context

Gates were the only supply of width, so a build's shape was a function of its
depth alone: two runs standing at gate 6 held the same pipeline whatever else
they had done. ADR-034 deleted the old coverage ladder to stop coverage being
priced twice, once by the gate and once by the shop. ADR-035 then split that
number in two: the gate reads a per-attempt meter that resets every window,
while the run keeps a lifetime total nothing spends. The lifetime total is free
to carry a ladder again.

## Decision 1: eleven slots, and gates open three of them

The cap drops from 14 to 11. Three slots are free at the start; the remaining
eight are grants, each with its own condition:

| Slot | Opens on |
| --- | --- |
| 4 | gate 1 cleared |
| 5 | gate 3 cleared |
| 6 | 60% coverage |
| 7 | gate 6 cleared |
| 8 | 140% coverage |
| 9 | 240% coverage |
| 10 | gate 10 cleared **or** 300% coverage |
| 11 | gate 11 cleared **or** 380% coverage |

The last row stops at gate 11 rather than the summit: clearing gate 12 wins the
run, so a slot behind it could never be filled.

A build that clears on checks and ignores coverage stalls at seven slots. A
build that covers hard widens through a gate it keeps missing. The rows
live-tune in `pipeline.model.ts` (`SLOT_UNLOCKS`).

## Decision 2: the coverage axis reads the run's lifetime total

`state.coverage`, every category summed, never reset. Not the gate's window
meter (`window.coverageGained`), which ADR-035 made fresh per attempt. Two
different numbers, so no build pays for one thing twice.

## Decision 3: width is a count of grants earned, not the highest one reached

Earning a grant out of order pays out now: a run at 60% coverage with no gates
cleared holds four slots, not three-with-a-sixth-owed. `slot` in the table
numbers a grant's expected arrival, nothing more. Coverage falls on a wrong
answer, so a grant already banked is never taken back, and the next-slot
preview skips any grant the width in hand already covers.

## Decision 4: width claims itself on the answer as well as on the clear

The gate axis can only move at a clear, but the coverage axis moves on any
answer, including the answers of an attempt that goes on to fail. Both funnel
through one reducer step, so a coverage grant lands the moment it is earned and
survives the miss. One answer crossing two thresholds announces both.

## Consequences

- The clear-rewards list on the gate screen names a slot only when *that gate's*
  clear is what opens the next one; a coverage-staged slot is not a reward for
  clearing. It also numbers the slot from the live width, which is what that
  line was meant to say all along (it was printing the gate number).
- Locked slot rows now name a coverage total as well as a gate, so the shop,
  prep and start screens all had to learn a second reason. The wording differs
  by surface (the modern rail says "Unlocks at 60% coverage", the shop's table
  row says "Opens when Gate 3 clears, or at 300% coverage"); worth unifying.
- Peels stay tuned against width (`GATE_FAIL_STRIPS` holds roughly a quarter of
  the pipeline). A narrower late run means the deepest rows now peel a larger
  share of the build than they did at 14 slots; watch the last two gates.
