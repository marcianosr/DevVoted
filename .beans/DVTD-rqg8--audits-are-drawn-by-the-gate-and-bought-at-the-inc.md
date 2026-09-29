---
# DVTD-rqg8
title: Audits are drawn by the gate and bought at the incident desk
status: completed
type: feature
priority: high
created_at: 2026-09-28T13:48:40Z
updated_at: 2026-09-28T15:45:11Z
parent: DVTD-h175
---

**What:** Gates draw their own audits again, and a rival's incident is bought in the shop and replaces one of them.

**Why:** Earning an attack from a HEALTHY clear hands the strongest player the most ammunition, and a quiet day leaves the gates empty.

## Done when

- [x] A gate from 3 up carries its capacity in audits, drawn on the date, with no rival involved
- [x] The shop occasionally deals one revealed incident you may buy, refresh or replace
- [x] A filed incident replaces one of the target's drawn audits, never adds to them
- [x] You file from a climber's card on the community map, at your gate or ahead
- [x] Nothing is handed out for clearing a gate, and the debrief stops saying so
- [x] Runs saved under the old shape still load

## Notes

Plan: `~/.claude-work/plans/i-wanna-redesign-the-wise-snowglobe.md`

Reverses two shipped decisions: every audit being a rival's shot, and a strong clear arming one. Keeps the capacity curve, the pools, the family and deny rules, the queue and the lock.

## Decided (2026-09-28, Marciano)

 Question    | Decision
-------------|----------------------------------------------------------
 Draw seed   | The date. Everyone climbing today at gate 6 meets the same gauntlet
 Pool match  | A target is eligible only if their next gate's pool holds the audit you carry. A cheap audit has a shorter reach
 Targeting   | The existing rules survive whole: at your gate or ahead, last close cleared HEALTHY or better, not your previous target, room at the gate, and you stand at gate 3 or deeper
 Buy where   | The shop's Incident desk
 File where  | The climber card on the community map
 Offer rate  | One shop in three from gate 3, seeded per shop
 Words       | Incident desk, the audit's own name, Replace held, Refresh. Never "package"

## Summary of Changes

ADR-138. Two shipped decisions reversed: audits are no longer only a rival's doing, and a strong clear no longer arms one.

**The gate draws again.** `gateAuditsFor(gate, date, incidents)` in `auditSchedule.model.ts` is the whole rule — incidents first, then `drawPayloads` fills the remaining room. Because `drawPayloads` already excludes the ids it is handed and their families, replacement, the family rule and the deny pair are one call. `withLockedGate` became `withGateAudits` and takes the date, so `settleIncidents` takes it too.

**The desk.** `heldAudit.model.ts` lost the sealed / open / keep / repackage surface, which no screen had ever dispatched, and gained deal / buy / refresh. The offer is derived from the gate and the refresh count, exactly as `draftSeed` derives the config offers, so no seed is plumbed through any action and none can be client-picked. `withSeed` is deleted.

**Targeting** gained one clause: the audit you carry must be in the pool of the gate it would land on. POOL_C is not a superset of POOL_A, so without it a 404 bought at gate 3 would have made the Champion's gate easier. The three-rival cap is gone, and the fire payload is `{ targetRunId }` alone.

**Surfaces.** New `IncidentDesk.ui` in the shop's right column; `Header` gained a `held` chip beside the balance; `ClimberCard` gained a `file` press; prep's `AttackPanel` and its presenter are deleted. The `audits` strip on `ShopScreen` was kept rather than repurposed, because it is the only thing documenting the 405-closed shop (DVTD-s6t1).

**Verified:** 4683 tests pass; `npm run lint` clean (oxlint, dependency-cruiser, docs:check); `npm run build` compiles. 14 failures and 3 type errors remain in `CommunityView.spec.tsx` — pre-existing at session start, from a parallel refactor that unexported `leadersFor` / `seatsFooterFor`.

**Not built, deliberately:** a standalone discard press. Buying already replaces what you hold, so discarding alone costs nothing and gains nothing (recorded in rejected.md).

**Left for a playtest:** `INCIDENT_OFFER_ONE_IN` (3), `INCIDENT_KB` (32) and the refresh ladder are guesses in `rules.model.ts`. The dev rig's simulated rivals were deleted rather than rewired — it drives a local reducer and cannot see cross-run state.

## Caught after the build

The offer was first seeded on the gate number alone, mirroring `draftSeed`. That is fine for the config offers, where you always get five and only *which* ones vary — but for a yes/no roll it fixes the schedule forever: gate 5 would deal an incident on every run of every day, and no other gate ever would. A probe over thirteen gates showed exactly one offer, permanently.

The seed now also carries **the id of the first poll the coming window will ask** (`incidentWindowIndex` remembers which, so a refresh re-rolls against the same window). Across seven simulated days the schedule reads `.!...!!...`, `!......!..`, `.....!!!..`, … — one to five offers per climb, averaging the intended three, same for everyone that day. `oneInSeeded` itself was measured uniform (349/1000 at 1-in-3), so the bias was entirely in the seed inputs.
