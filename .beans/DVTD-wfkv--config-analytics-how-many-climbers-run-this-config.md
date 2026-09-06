---
# DVTD-wfkv
title: 'Config: Analytics, how many climbers run this config'
status: todo
type: feature
priority: normal
tags:
    - config
created_at: 2026-09-01T20:26:12Z
updated_at: 2026-09-06T09:57:03Z
parent: DVTD-72d9
blocked_by:
    - DVTD-144r
---

An information config: while installed, every shop offer row and build row carries the share of today's climbers holding that config ("31% of climbers").

DVTD-144r explored this space and picked a Configdex column for v1, holding the decision-time reveal back as "a paid config". This bean is that config.

## Naming

"Analytics" is the weakest part of the ask. Two problems: the roster names real things (.length, Prefetch, WTFPL, Volkswagen CI) rather than describing an effect, and **Telemetry** already sells community data (the answer split), so Analytics next to it reads as the same product twice.

The exact real-world analogue for "how many people installed this package" is **npm downloads**. My pick, with **State of JS** as the survey-framed alternative. Keeping "Analytics" is fine if the name is worth more than the collision, but say so on purpose.

## Shape

Follows the information configs already in the roster (Prefetch, .length, Telemetry): family `defense`, `slots: 2`, `rewardMultiplier: 1`, one new boolean on `Config` (`revealsInstallShare`), 64 KB at the standard 32 KB a slot. No per-use fee: the draft cost is the price (Telemetry's doubling fee buys a per-poll action, this buys a passive display).

ADR-022 is superseded by ADR-035, so the config owes the gate no check. Slots and KB are the whole cost.

## Which number, and from where

**Today's seed, snapshotted at gate boundaries.** The daily run is shared, so "people in run" is everyone on today's seed. Counting continuously would make a config's display depend on live social data; counting at gate boundaries gives the same answer a real analytics dashboard gives, one that lags.

Source is `run_states.state` JSON across active runs, the same aggregation shape as `fetchActiveRunStats`. That answers "holding right now", which is exactly the question asked, and it needs no new table (a draft event row would be needed for keep rate later, out of scope here).

Never a win rate or a depth figure. That hands over a solved draft and is the line DVTD-144r draws too.

**Quorum floor, enforced server-side.** Below N climbers the figure is withheld, not estimated. Withhold precision, never falsify.

**Upgrade path** reuses Telemetry's calibration ladder: v1 shows the percentage, v2 shows the denominator ("31% of 148 climbers"), which is the difference between a number you can trust and one you cannot. `showsSampleSize` already keys off level 2.

## Risks

- **Meta convergence.** Showing what is popular makes it more popular, and build variety is what a roguelite lives on. Partly bounded by the config being opt-in and paid, so only holders see it. Watch whether holders' builds converge faster than non-holders'.
- **Popular is not good.** A cheap 1-slot config offered in every starter stack will top the chart. The copy must read as an install count and never imply strength.
- **Privacy.** Aggregates only, never who holds what, with a k-anonymity floor on top of the quorum.
- **WTFPL.** The full-roster shelf plus a per-row figure is a lot of numbers on one screen. Decide whether the share renders on all of it or only the first screenful.

## Todos

- [ ] Settle the name (npm downloads / State of JS / Analytics)
- [ ] Roster entry plus the `revealsInstallShare` field and its `gives` line
- [ ] Server aggregate over active `run_states`, quorum-floored, cached per gate boundary
- [ ] Shop offer row and build row render the share as a compact trailing figure, not a callout
- [ ] v2 adds the denominator
- [ ] Tests: withheld below quorum, counts holders not installs-ever, no figure without the config installed
- [ ] Wiki 4.3 roster and 4.5 if it lands as a paid action after all
- [ ] CHANGELOG (player-visible)
