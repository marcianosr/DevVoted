# ADR-148: Every number wears a badge

## Status

Accepted — 2026-09-29 (Marciano, DVTD-2wak). Amends
[ADR-066](066-every-figure-wears-a-badge.md) decisions 1 and 3.

## Context

ADR-066 badged money, percentages and multipliers and left a count bare: "peeked
5 times" badges nothing. The prep redesign (ADR-149) badges `gate 3`, `all 5
right`, `2 polls left`, the rungs under the ladder and the steps of a unit ladder.
On one screen the same kind of number was reading two ways.

## Decision

1. **A count the screen states wears a badge**, the same as a figure. A gate
   number, a poll count, a rung, a step on a unit ladder.

2. **`Figures` is unchanged.** Its parser cannot tell a count from a code in free
   prose, so a count inside a sentence is badged by the viewmodel: it builds a
   `Lead` line with a `{ figure }` part.

3. **Two exemptions stand.** The hero readout (ADR-066 decision 2), and the weight
   block with its build slot counts in words (ADR-047, ADR-060). A column heading
   and a measure's name (`1 unit`) are labels, not stated numbers.

## Consequences

- Scoring slot counts badge. ADR-066's "slot counts are not figures" now means
  build slot counts.
- Holdouts to follow in their own bean: the run-over bar's rung marks
  (`CoverageBar marks="rungs"`), "Audits are unlocked at gate 3", the estimate
  cards' "at least 3 of 5", the header's gate title.
