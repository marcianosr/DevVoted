---
# DVTD-d9e0
title: Decide what replaces starter slots as a permanent unlock
status: draft
type: feature
priority: normal
tags:
    - meta-progress
created_at: 2026-09-24T18:26:37Z
updated_at: 2026-09-24T18:26:37Z
parent: DVTD-z2r2
---

**What:** Decide and price what a player permanently earns in place of the starter slots that no longer exist.

**Why:** Slots were one of the three things meta progression was going to grant, and deleting them left that axis empty.

## Done when
- [ ] Decided: permanent free weight, a permanent discount on the upkeep bill, or neither
- [ ] Whatever is picked is priced against the storage plans it competes with
- [ ] Earning it has an objective in the same shape as the config objectives
- [ ] A player can see what they have earned and what it is worth

## Notes

Split out of DVTD-2try on 2026-09-24, which closed with this question still open.

The original plan granted extra starter config slots per account. ADR-074 deleted
slots: capacity is soft now, and how much build you can carry is set by the
storage plan's free weight and the upkeep you can afford.

Both candidates are strictly stronger than a starter slot was, because they apply
at every gate rather than once at the deal. That is the problem: free weight and
a cheaper upkeep bill are the two things the storage plan ladder already sells, so
a permanent grant either devalues the ladder or has to be small enough to be
unnoticeable. Price it against the ladder before designing the objective, not
after.

Also open, inherited from DVTD-2try: "hit a coverage threshold in the config's
own category" as an unlock trigger has to survive the per-gate coverage reset
(ADR-073 decision 4). Same problem as DVTD-h9s5, and it should get the same
answer.

Configs and borders are settled and out of scope here: configs unlock on
individual objectives (ADR-051), borders are bought with the archive (DVTD-8kiu).
