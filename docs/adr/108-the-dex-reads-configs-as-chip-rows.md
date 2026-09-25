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

1. **One row of chips per weight, heaviest first.** The heading states the weight
   and how much of it you hold ("2 weight · 4 of 14"). Inside a weight, granted
   chips read before locked ones.
2. **Two states are live: granted and locked.** A granted chip shows weight, name,
   ladder dots, the headline figure as a badge and an `i`. A locked chip shows its
   weight, a redacted name and an `i`. The met chip (named, dimmed, effect
   withheld) exists as a Story only, until a reveal ledger feeds it (DVTD-s5vo).
3. **The unlock paths sit behind the locked chip's `i`.** Both paths, with live
   progress, open on hover or on a press. The visible-caption rule existed because
   tooltips were dead on touch; the kanto popover has opened on a press since
   2026-09-23, so the rule goes.
4. **The version tag names the ladder's ceiling.** The kit's pennant, stating how
   far the config can climb inside a run: v5 for most, v2 for Telemetry, git
   rebase -i and Dependabot, nothing at all for the 22 with no ladder. Not the
   rung an install gives you: in the run a v1 config wears no tag, and a chip
   reading v1 on every upgradable config would both contradict that and say
   nothing. The rung you install is named in the hint ("starter · v1 of 5"), and
   nothing persists a version across runs (DVTD-fv8x), so no tag claims one. The
   DVTD-38e9 rung reader (per-rung prose, price and roll odds) goes: what v2 buys
   is stated where it is bought, in the shop's Upgrades panel.
5. **A locked chip wears a dashed edge.** In the kit a dashed cell is an empty spot
   you can fill now. A locked config qualifies: both paths are live and count on
   their own, so play already underway fills it.

## Consequences

- `DexConfigChip` joins the kanto kit and wears the existing `Version` pennant;
  `DexConfigs` renders weight groups; the Dex component holds which chip's hint
  is open.
- The Dex states no roll odds. ADR-097 decision 4's Dex sentence points here.
- The met state has a chip and no data. The reveal ledger is DVTD-s5vo.
- A word-shaped effect ("peek") wears no badge, since only a figure does
  (ADR-066); its sentence sits in the hint.
- "in your deck" from the mock is not adopted; the tab's existing tags, starter
  and earned, lead the hint.
