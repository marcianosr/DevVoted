---
# DVTD-0now
title: Run services are bought on the new run screen and applied on start
status: in-progress
type: feature
priority: normal
created_at: 2026-09-25T10:58:50Z
updated_at: 2026-09-29T18:23:27Z
parent: DVTD-r2k9
---

**What:** The new run screen gains a warm boot panel: while a run is still being configured, archived storage buys Boot Cache (three rungs at two archived KB per KB banked) and carries Extend and the git tag into the run, paid once by the start press in one transaction.

**Why:** The archive only ever went up; ADR-115's run services sat unbuilt on a profile page nothing links to, and the moment a player wants to spend is the moment a run opens.

## Done when

- [x] The warm boot is drafted locally and paid by the start press in one transaction with a guarded archive debit that refuses a balance it cannot cover
- [x] Boot Cache banks 64, 128 or 256 KB for 128, 256 or 512 KB of archive; one rung at a time
- [x] Extend and the git tag are carried in for an archive price and the shop sells them only to a run that carried them
- [x] A service the run did not carry is named in the shop with where it is carried and no press
- [x] Only unlocked services are listed on the panel, and with none unlocked the panel is not drawn
- [x] The Dex reads where each service is carried and what its press costs; the registry/run scopes are gone

## Notes

Decided 2026-09-29, ADR-153 (amends ADR-115 D1, D3, D10 and ADR-112 D1, D4). Marciano's ask: "players should be able to inject more run KB … convert archived KB to run KB to have a warm boot", "rebuild is for free, but others are unlocked but cost archived KB and need setup in your run. So this means it can be selected at each new run, costing archived KB". Four forks settled the same session: bought on the new run screen, not the profile; the archive buys the right to press, the press still costs run KB (ADR-029 stands); the extra weight slot was dropped, Boot Cache buys width through rent (rejected.md); three rungs, not a free amount; the community milestone is a draft bean.

### Superseded 2026-09-29 (ADR-153)

The design below was ADR-115's: run services bought on the profile, waiting in a `user_run_services` table, consumed by `createRun`. None of it was built; the warm boot replaces it and the table is not needed, because purchase and run state update are one transaction on a run that already exists in `configuring`.

**What (old):** A run service is bought once per run from the archive, on the profile, waits for the next run, and is consumed when that run starts.

**Why (old):** The archive buys nothing but borders, and the page that spends it is unreachable.

Old done-when: a purchase debits the archive in one guarded step and refuses a balance that cannot cover it · at most one of each run service waits per account, and starting a run consumes what is waiting · the new-run screen lists what the run carries in · the Dex states each run service's price and sells nothing · an account with an empty archive is shown the price, not a press.

- Decided in ADR-115 D1, D2, D7. The profile is the till (DVTD-8kiu's one-page rule); the Dex only states.
- Ownership shape: a `user_run_services` table `(user_id, service_id, bought_at, consumed_by_run_id nullable)` with a partial unique index on `(user_id, service_id) WHERE consumed_by_run_id IS NULL`. A purchase precedes the run, so it cannot key on `run_id`; one waiting row per service is "once per run" enforced by the database; each new service is a roster row, not a migration.
- `createRun` consumes waiting rows before creating, the `consumePinnedGate` precedent (`run.repository.ts`, SELECT FOR UPDATE then clear), and stamps what it consumed into the run snapshot the way `startedAtGate` already rides it.
- The archive debit rebuilds `debitArchivedStorageGuarded` (DVTD-lqjt kept the shape): `UPDATE users SET archived_storage = archived_storage - $bytes WHERE id = $1 AND archived_storage >= $bytes RETURNING archived_storage`, in the same transaction as the row insert. `purchaseBorderTx` does SELECT-then-UPDATE today and is not the model to copy.
- Units: `archived_storage` and `border.cost` are bytes; run storage is KB. Run-service prices go in bytes beside the borders (256 KB to 32 MB).
- A panel renders only when it holds something (ADR-115 D9).
- Slice 1 (the Dex split) shipped with the run-services footer saying the git tag is still bought in the shop; that line changes here.

## Summary of Changes

- Domain: `BOOT_CACHE_RUNGS` (64/128/256 KB at `BOOT_CACHE_RATE` 2), `EXTEND_CARRY_BYTES`, `PIN_CARRY_BYTES` in `rules.model.ts`; the roster lost `scope` and gained `carryBytes` with the `CarriedServiceId` tripwire, `isCarriedService`, `registryControlOf`, `isRegistryControlId`; `RunState.warmBoot` (no snapshot change); `warmBoot.model.ts` (`warmBootRefusalOf`, `warmBootOrderOf`, `carries`, `bootRun`); a server-minted `warm-boot` action; `extendAvailable` and `pinSoldAt` require the carry.
- Server: `debitArchivedStorage` (guarded UPDATE … RETURNING) in the run repository; `warmBoot.service.ts` builds the order from the pick and the account's unlocks and debits inside the dispatch transaction's settle seam; `warmBootRun` server function on `warmBootPickSchema`; `startRunService` now returns the archive balance and the unlocked services.
- Client: `useRunActions().warmBoot`; `StartView` holds the draft and commits it with the footer press (`Pallet gate prep · 384 KB archive`, saffron `commit` tone on `Action`); `WarmBoot.ui` panel with `Pick` checkboxes under the build; `RegistryControl.ui` gained the `carried: false` arm the shop uses for an uncarried row; the Dex services tab lost its scope filter and reads carry and press prices.
- Docs: ADR-153, README, rejected.md, ADR-115/112/036 pointers, wiki, CONTEXT, CHANGELOG.
