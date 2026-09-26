---
# DVTD-k59a
title: Services are unlocked once per account and redacted until then
status: completed
type: feature
priority: normal
created_at: 2026-09-25T11:33:12Z
updated_at: 2026-09-25T18:06:12Z
parent: DVTD-r2k9
---

**What:** Every service is unlocked once per account by an objective; until then the shop and the Dex show it redacted, with one line saying how to unlock it.

**Why:** Services arrive as a fixed set the moment a gate opens, so nothing about them is earned and nothing about them is learned.

## Done when

- [x] Rebuild is unlocked from the start; Extend unlocks on first reaching Cascade; the git tag unlocks on first reaching gate 4
- [x] A locked service reads redacted in the shop and in the Dex, with a line stating how to unlock it and no press
- [x] An unlock is permanent and written once, however many times the objective is met again
- [x] In-run gate staging still applies on top of the unlock
- [x] The four unbuilt services carry their suggested unlock in their own beans

## Notes

Marciano, 2026-09-25, with a shop mock (the Services panel with four rows and "balance 310 KB" in the header):

| Service | Suggested unlock |
| --- | --- |
| Rebuild | Starter service |
| Extend | Reach Cascade for the first time |
| Hot Reload | Rebuild the Registry 5 times |
| Return Policy | Sell 5 drafted configs |
| git tag | Reach gate 4 |
| Boot Cache | Bank at least 256 KB from one run |
| Docker Image | Finish a run with one starting config still installed |

Registry services: "unlocked permanently, then bought with run KB whenever available in a Registry". Run services: "unlocked permanently, then rented for a run with archived KB".

This is Grant on shop verbs, which DVTD-2try (2026-08-26) and DVTD-8zb3 (2026-09-24) refused: "the player who keeps dying at gate 3 never meets Extend, and that is exactly the player who needs it". Asked for explicitly on 2026-09-25 and built; the ADR records the reversal.

## Summary of Changes

ADR-116 written. Every service carries an `unlock` on the roster (`registryControl.model.ts`): Rebuild is a starter, Extend and the git tag are earned objectives on a new `reached-gate:N` metric that `clearMetrics` emits for every gate a clear reaches (`gates-cleared` sums across runs and cannot say depth). `servicesUnlockedBy` runs off the same RETURNING counts as `configsUnlockedBy` inside `grantObjectiveUnlocks`, so a grant lands in the transaction that crossed it; the row goes to the new `user_service_unlocks` table (schema, guarded migration `20260925150000_add_service_unlocks.sql`, reset drop list, pushed to the local database). `RunView.unlockedServiceIds` is read by `viewOfRun` and the dispatch path; the Dex reads the new `getServiceUnlocks` server function and invalidates it after every run action.

The shop lists services in roster order: a locked one is a redacted `RegistryControl` row with `unlock · <objective>` where its detail would be and no press; an unlocked one follows the gate staging it always had. The Dex's `controldex` now takes the account's unlocked ids (unlocked or locked) instead of the deepest gate, and `GateRunsData.deepestGate` was deleted. The redacted label became "Locked service" (mirroring "Locked config"). A `Locked` story was added to `RegistryControl.stories` because the unlock line is the player's only route to learning how a service is earned.

Suggested unlocks for Hot Reload, Return Policy, Boot Cache and Docker Image are recorded on DVTD-r2fg, DVTD-rte1, DVTD-8as9 and DVTD-oc69 (the last two need a metric that does not exist yet). DVTD-2try and DVTD-8zb3 carry the reversal.

Verified: 3765 tests pass (198 files), `tsc --noEmit` clean, oxlint 4 pre-existing warnings in untouched files, dependency-cruiser clean over 726 modules, wiki in sync, prettier clean on every touched file, `beans check` 8 pre-existing broken links none from this pass. `npx drizzle-kit push` applied the table locally.

2026-09-25, later (DVTD-lm8p): D3 reversed to named, not redacted; a locked row shows its name, a ? glyph and the unlock line in the price slot. The two-panel Dex became one section.
