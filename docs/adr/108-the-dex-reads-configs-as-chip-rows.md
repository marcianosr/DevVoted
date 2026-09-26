# ADR-108: The Dex reads configs as chip rows

## Status

Accepted (2026-09-24, Marciano, DVTD-zdra). Replaces the DVTD-38e9 card grid.
Retires the visible-caption rule of ADR-050 decision 5 and ADR-051 decision 7,
and amends ADR-097 decision 4: the Dex no longer states roll odds.

## Context

The Configs tab spent a card per config. Marciano's mock reads the roster as rows
of chips grouped by weight, each chip carrying weight, name, ladder dots, the
effect figure and an `i`. The mock's three chip states are ADR-050's three
Configdex states. Only "met" has no data: nothing writes a reveal ledger.

## Decision

1. Superseded by ADR-120 decision 5 (the heading is a labelled bar). Grouping by
   weight, heaviest first, with granted before locked, is unchanged.
2. Superseded by ADR-120 decision 1: the Dex draws `ConfigChip`, and the three
   states are which props are present rather than a discriminator.
3. Superseded by ADR-120 decision 1: the unlock paths are the card's body, not a
   panel behind an `i`.
4. **The version tag names the ladder's ceiling.** The kit's pennant, stating how
   far the config can climb inside a run: v5 for most, v2 for Telemetry, git
   rebase -i and Dependabot, nothing at all for the 22 with no ladder. Not the
   rung an install gives you: in the run a v1 config wears no tag, and a chip
   reading v1 on every upgradable config would both contradict that and say
   nothing. The rung you install is named beside the effect ("starter · v1 of 5"),
   and nothing persists a version across runs (DVTD-fv8x), so no tag claims one.
   The DVTD-38e9 rung reader (per-rung prose, price and roll odds) goes: what v2
   buys is stated where it is bought, in the shop's Upgrades panel.
5. Superseded by ADR-120 decision 3: the dashed edge is the locked card's, and a
   blackout with no live path keeps the solid one.

## Consequences

- The Dex states no roll odds. ADR-097 decision 4's Dex sentence points here.
- The met state has no data. The reveal ledger is DVTD-s5vo.
- A word-shaped effect ("peek") wears no badge, since only a figure does
  (ADR-066); its sentence is the card's effect line.
- "in your deck" from the mock is not adopted; the tab's existing tags, starter
  and earned, lead the card.
