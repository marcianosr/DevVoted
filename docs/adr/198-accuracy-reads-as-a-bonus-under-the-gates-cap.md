# ADR-198: Accuracy reads as a bonus under the gate's cap

## Status

Accepted — 2026-10-11 (Marciano). Replaces the live reading in ADR-170 Decision 6.

## Context

The accuracy bar showed a pessimistic floor (every poll ahead a missed multiple) and a
best case. Players read it as a number that barely moved on a right answer. Marciano
wanted it to read like a score built during the gate.

## Decision 1: a live bonus under a cap

- A right answer raises the **bonus**; the gate's **cap** stays.
- A wrong answer leaves the bonus; the cap drops.
- The bonus never passes the cap. When a wrong answer drops the cap below it, the
  bonus drops with it.

The bonus is `1 + carried + 0.016 × credit earned` (a fifth of the gate's 0.08 per
credit), capped at the gate's best case. The step is fixed so a wrong answer never
moves the bonus while the poll mix is still hidden.

## Decision 2: payout does not change

A wrong answer lowers the cap by its lost gain plus the existing penalty (0.016 +
0.008 on a single). The cap is the old best case, so the gate still closes on
`bonus + 0.08 × share − 0.04 × (1 − share)` (ADR-181): at the close the bonus meets
the cap. Only the live reading changed.

## Decision 3: the bar is a window ticked every ×0.05

The bar spans 0.25, starting at the carried multiplier rounded down to ×0.05 (×1.00
at Pallet). The fill reaches the bonus, a hatched stretch reaches the cap, and the
bonus figure sits above the end of the fill. No line of explanation sits over it.

## Consequences

- The guaranteed floor stays in the code for coverage projections; only the bar reads
  the live bonus.
- A gate-outcome bar draws the landed multiplier with nothing hatched.
