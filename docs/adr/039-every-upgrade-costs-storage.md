# ADR-039: Every upgrade costs storage, Focus included

## Status

Accepted — 2026-08-18 (Marciano, DVTD-yx92). Amends ADR-006's upgrade economy and reverses the "free + coverage-gated" half of the Focus upgrade rule recorded in the wiki's §4.4.

## Context

Focus configs upgraded on category coverage alone: reach 5% JavaScript and the level was free. Every other upgradable config paid `upgradeStorageCost`. In the shop that showed up as an Upgrade button with no price on it at all, which is what Marciano spotted in a playtest — a spend control that costs nothing reads as a bug, and eleven of the roster's configs are Focus configs, so the free path was the common one.

## Decision: coverage is permission, KB is the price

Every upgrade pays `upgradeStorageCost(level)` — 32KB × (level + 1). A Focus config now answers to **two independent gates**: its category's coverage says the level has been earned, and the storage says it can be afforded. Neither substitutes for the other, so an earned upgrade can still be out of reach and a funded one can still be unearned.

The shop asks them separately (`upgradeEarned`, `upgradeAffordable`) so the tooltip can name whichever is in the way, or both. The price moves onto the button face, where every other spend in the shop already carries it — which retires the earlier "no price on the Upgrade button" convention, since that only made sense while the button was free.

## Consequences

- Mastery stops being a free win. A category you have ground out still costs storage to cash in, so a coverage lead competes with drafting for the same KB.
- The reducer's two upgrade branches collapse into one guard plus one charge.
- Balance to watch: eleven Focus configs at 64KB for L2 is a real early-game tax, and the gate reward at gate 1 is 32KB. If the first upgrade lands too late, `UPGRADE_STORAGE_STEP_KB` is the knob — not the coverage requirement, which is the part that says you earned it.
