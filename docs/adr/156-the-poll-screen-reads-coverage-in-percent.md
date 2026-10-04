# ADR-156: The poll screen reads coverage in percent

## Status

Accepted — 2026-09-29 (Marciano). Supersedes ADR-106.

## Context

ADR-106 had the poll screen speak units on the coverage bar (`35 of 40 · SHAKY`)
so a cleared gate raised the line instead of halving the figure. Every other
surface that draws the bands states them in percent: prep's band ladder, the
debrief, run over and the shop. The poll screen was the one place the bands
read in a different figure from the one they are drawn in.

## Decision

The poll screen's coverage bar speaks percent, like every other bar. The
header, the pin, its announcement and the HEALTHY mark state the percent held.
`CoverageBar` drops its `units` prop: nothing else passed it.

The lead line under the bar still counts units against slots, so the units a
gate banked stay stated once.

## Consequences

The halving ADR-106 fixed is back: Pallet at 42% reads 21% at Boulder having
lost nothing. The lead line is the only place that explains it.
