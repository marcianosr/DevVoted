---
# DVTD-kgch
title: 'Death loot: dying open-sources the build (MIT is the default, not a config)'
status: draft
type: feature
created_at: 2026-09-06T08:04:59Z
updated_at: 2026-09-06T08:04:59Z
parent: DVTD-z2r2
---

## Design (2026-09-06 session)

Marciano's call: MIT-on-death is cooler as the default rule than as a purchasable config. When a run dies, its build open-sources: the configs post as loot other players can draft.

Why it passes DVTD-545v's guard rails by construction:

- **Copied, not taken.** Open source is non-rivalrous: the fallen player loses nothing (their configs were evaporating anyway), so the "loser must not lose what they banked" rule is satisfied without a minting workaround. Like DVTD-in1b, it directs ashes.
- **Completed runs only.** A dead run is a completed run; fix the loot pool at the day boundary (the DVTD-1z09 midnight question applies) so nothing live reads live social data.
- **Shared shelf, not per-player roll.** Fallen configs surface in one shared shop section visible to everyone on the seed, which also fits the special-shop-section pattern DVTD-trc0 is exploring.
- **Attribution required, because it is MIT.** Every looted offer names its source: "from Marciano's run, fell at gate 7". The attribution line is the water-cooler payoff and costs nothing.

## Sponsors (the config that rides on top)

2 slots. If Sponsors is installed when the run dies, every loot draft of your fallen configs pays a royalty (+16 KB placeholder) into your next run's opening balance. It only pays if it went down with the ship, which is the point. Async-safe: royalties are computed from completed drafts and settle at your next run's start.

## Todo

- [ ] Decide loot pricing (shelf price vs discount) and dedupe when many fallen builds carry the same config
- [ ] Decide the pool boundary: on-death vs midnight (DVTD-1z09)
- [ ] Decide whether seeing loot counts as Reveal/"met" for ADR-051's Configdex
- [ ] Decide whether Sponsors ships with v1 or after the shelf exists
