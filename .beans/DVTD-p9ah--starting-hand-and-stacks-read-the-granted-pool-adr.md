---
# DVTD-p9ah
title: Starting hand and stacks read the granted pool (ADR-051)
status: todo
type: feature
priority: normal
created_at: 2026-09-03T07:10:05Z
updated_at: 2026-09-06T09:23:59Z
parent: DVTD-z2r2
blocked_by:
    - DVTD-clgs
---

Flip the hand from STARTER_POOL to the account's granted configs. Deliberately lands after the ledger has been live, so progress has accrued before anything is taken away.

## Todos

- [ ] `grantedPool(unlockedIds)` replaces `STARTER_POOL` in hand.model.ts; the free set is a floor, so an empty column can never brick run start and the one-focus guarantee always holds
- [ ] `startRunService` fetches unlocked ids (`fetchUnlockedConfigIds`, sibling of `fetchOwnedSwatchIds`); snapshot them as `grantedConfigIds` on RunState
- [ ] `stackAvailable(stack, grantedIds?)` guards `pickStack`; undefined means everything granted (proto-run, pre-migration snapshots)
- [ ] configure/start screens dim or filter locked stacks via the same helper
- [ ] proto-run untouched: client-only, fully unlocked by construction

- [ ] guaranteed seat (ADR-064): seed the newest unplayed earned config (`first_installed_at IS NULL`, `via_metric` not null) into the hand before the draw; the focus band counts it and pairability repair never evicts it; set `first_installed_at` on first install

## 2026-09-06 note (DVTD-0sjo)

`fetchUnlockedConfigIds` reads the `user_config_unlocks` table (ADR-064), not a text[] column.
