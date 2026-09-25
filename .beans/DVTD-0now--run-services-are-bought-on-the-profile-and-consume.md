---
# DVTD-0now
title: Run services are bought on the profile and consumed at run start
status: todo
type: feature
priority: normal
created_at: 2026-09-25T10:58:50Z
updated_at: 2026-09-25T11:00:07Z
parent: DVTD-r2k9
---

**What:** A run service is bought once per run from the archive, on the profile, waits for the next run, and is consumed when that run starts.

**Why:** The archive buys nothing but borders, and the page that spends it is unreachable.

## Done when

- [ ] A purchase debits the archive in one guarded step and refuses a balance that cannot cover it
- [ ] At most one of each run service waits per account, and starting a run consumes what is waiting
- [ ] The new-run screen lists what the run carries in
- [ ] The Dex states each run service's price and sells nothing
- [ ] An account with an empty archive is shown the price, not a press

## Notes

- Decided in ADR-115 D1, D2, D7. The profile is the till (DVTD-8kiu's one-page rule); the Dex only states.
- Ownership shape: a `user_run_services` table `(user_id, service_id, bought_at, consumed_by_run_id nullable)` with a partial unique index on `(user_id, service_id) WHERE consumed_by_run_id IS NULL`. A purchase precedes the run, so it cannot key on `run_id`; one waiting row per service is "once per run" enforced by the database; each new service is a roster row, not a migration.
- `createRun` consumes waiting rows before creating, the `consumePinnedGate` precedent (`run.repository.ts`, SELECT FOR UPDATE then clear), and stamps what it consumed into the run snapshot the way `startedAtGate` already rides it.
- The archive debit rebuilds `debitArchivedStorageGuarded` (DVTD-lqjt kept the shape): `UPDATE users SET archived_storage = archived_storage - $bytes WHERE id = $1 AND archived_storage >= $bytes RETURNING archived_storage`, in the same transaction as the row insert. `purchaseBorderTx` does SELECT-then-UPDATE today and is not the model to copy.
- Units: `archived_storage` and `border.cost` are bytes; run storage is KB. Run-service prices go in bytes beside the borders (256 KB to 32 MB).
- A panel renders only when it holds something (ADR-115 D9).
- Slice 1 (the Dex split) shipped with the run-services footer saying the git tag is still bought in the shop; that line changes here.
