---
# DVTD-uv4a
title: 'Config: Hotfix'
status: todo
type: feature
priority: normal
tags:
    - config
created_at: 2026-08-15T13:55:05Z
updated_at: 2026-09-22T06:42:49Z
parent: DVTD-72d9
---

Failed gate opens shop +32KB per peel

## Re-aimed 2026-09-21 (Marciano), still to build

**A SHAKY close's peel obligation drops 25%.**

### Why the old design had to go

The body above ("failed gate opens shop") describes something the game **already does**.
ADR-037 Decision 3 is live: *"a repeated gate goes review -> shop -> prep -> the same
gate."* Re-aiming was necessary, not preferable.

### It does not collide with Garbage Collection

DVTD-72d9's 2026-08-14 correction gave GC the peel *refund* (a dropped config pays its
sell value). This is the *obligation* — a different dial. They stack: Hotfix lowers what
you owe, GC pays you back for what you dropped.

### The cut must come off the SLOT QUOTA, not the KB bill

ADR-076 Decision 6: *"The peel is a quota of slots, priced in KB. `peelQuotaSlotsFor`
stays the authority on how much comes off... so one debt has two currencies and one
number."* Cutting only the KB bill would break that invariant.

`RunState.peelSlotsRemaining` (written at `answer.model.ts:214`) is the single
authoritative number. Note `peelBillKbOf` (`gateOutcome.viewmodel.ts:351`) is an
independent re-derivation that omits both the audit extra and the attempts escalation, and
the prep forecast (`runView.viewmodel.ts:423`) is a **third** formula. Any change to the
obligation has to land in all of them or they drift further apart.

### UNDECIDED: the rounding

Quotas are small integers (`Math.ceil(occupied * share)`), so rounding is the whole design.

| quota | x0.75 floor | nearest | floor, min 1 |
| --- | --- | --- | --- |
| 1 | 0 | 1 | 1 |
| 2 | 1 | 2 | 1 |
| 3 | 2 | 2 | 2 |
| 4 | 3 | 3 | 3 |
| 6 | 4 | 5 | 4 |

- **floor** is the only option that always does something at the shallow gates, where a
  1-2 slot peel is the entire bill — but it waives a single-slot peel outright.
- **nearest** never waives a peel, but does nothing at all below quota 4, which is most
  early peels, so the config reads as broken for the first several gates.
- **floor, min 1** keeps "a peel always takes something" and still helps from quota 2 up,
  at the cost of the cleanest line Hotfix could have.

Settle this before building.

## Todo

- [ ] SETTLE THE ROUNDING (above)
- [ ] `Config.softensPeel` + the cut in `failPeelQuotaFor`'s caller
- [ ] Land it in all three peel derivations, or collapse them into one first
- [ ] Prep band table + debrief name the reduced obligation
- [ ] Roster entry, CONFIG_UNLOCKS, specs, wiki, CHANGELOG
