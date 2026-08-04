---
# DVTD-g1p0
title: Victory at gate 12 + victory reward
status: draft
type: feature
priority: normal
created_at: 2026-07-19T07:44:48Z
updated_at: 2026-08-04T16:35:05Z
parent: DVTD-kulw
---

Marciano leans toward VICTORY_GATE = 12 (currently 5): the game is won at gate 12. Open question: what the victory reward is — undecided, which is why this is a draft. Constant lives in rules.model.ts.

## Escalation constraint (2026-07-27)

VICTORY_GATE = 12 conflicts with current escalation: requirement = 1 + floor(gatesCleared/2) against a 5-poll window (SLICE_WINDOW). Gates 9-10 demand a perfect 5/5; gates 11-12 demand 6/5 — impossible for any build (no config lowers the requirement; all requirementDelta are 0, yarn.lock immunity DVTD-4xjs not built). Options: cap the requirement below SLICE_WINDOW, slow escalation (every 3 gates → max 4 by gate 12), or widen the window with depth. Slots are irrelevant to this — slot count never enters the gate check.

## Victory payout today (2026-08-04)

What does the player actually win? Currently only storage: storageCreditRate("victory") = 1 banks 100% of leftover storage to archived_storage (rules.model.ts:26). No other reward exists. Deciding the real prize is the core open question of this bean, alongside the escalation cap.

## Decision (2026-08-04, Marciano)

- **VICTORY_GATE = 12 confirmed** — expand from the current 5.
- **Add a way to continue past victory** (keep climbing after gate 12, endless-style). Same design conversation as the escalation cap: whatever fixes gates 11-12 must also hold for gates 13+.
- Still open: the victory reward (currently storage-only, see note above).
