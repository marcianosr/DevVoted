---
# DVTD-amtz
title: Unlocked configs never reach a run
status: completed
type: bug
priority: critical
created_at: 2026-09-15T14:13:52Z
updated_at: 2026-09-16T10:54:05Z
parent: DVTD-0x5c
---

`startRunService` hands the hardcoded `STARTER_POOL` (8 configs) to `startingHand`. `user_config_unlocks` is written at signup and during play, and read by the Dex, but never read here. Unlocking a config moves the Dex and nothing else.

The comment at the call site already says the pool "becomes the account's own pool once configs unlock (DVTD-2try)", in future tense.

- [x] Read the account's unlock rows in `startRunService`
- [x] Map config ids onto `CONFIG_LIST`, dropping ids no longer in the roster
- [x] Fall back to `STARTER_POOL` for an empty ledger (pre-seed accounts)
- [x] Spec: an unlocked config can be dealt into the starting hand

## Summary of Changes

`fetchUnlockedConfigIds` reads the whole ledger; `poolFor` in `hand.model.ts` maps ids onto `CONFIG_LIST` and falls back to `STARTER_POOL` when nothing survives. The mapping is a pure domain function, so it is specced without a database.

The fallback covers two cases that read identically: a pre-seed account with no rows, and an account whose every unlock has left the roster.
