---
# DVTD-n4rx
title: Inject archived storage at run start
status: in-progress
type: feature
priority: normal
created_at: 2026-06-13T08:51:00Z
updated_at: 2026-06-13T09:22:30Z
parent: DVTD-lwvx
---

Before starting a new run, the player can choose to inject some of their accumulated **archived storage** as starting capital — giving them more storage headroom from turn 1 without having to earn it through gate rewards.

## Why this matters

- Right now, archive only converts into cosmetics (borders). It has no mechanical use, making it feel inert for players who already own all borders.
- Letting players spend archive to front-load a run creates a meaningful meta-progression spend decision: save up for cosmetics, or buy yourself a better start?
- It rewards players who finish runs cleanly (large archive surplus) with a tangible in-run advantage — a classic roguelike loop: do well → bank resources → start stronger next time.

## Sketch of the flow

1. On the **new run screen**, a slider or step-selector lets the player choose how much archive to inject (e.g. 0 KB, 64 KB, 256 KB, 1 MB, custom).
2. The chosen amount is **deducted from `archived_storage`** and added to the run's `storage_limit` as starting storage.
3. The run begins with that extra storage already available — no gate needed to earn it.
4. If the player cancels run start after selecting an amount, no archive is spent.

## Design questions

- **Cap**: Is there a maximum inject amount per run? Without a cap, a player with 100 MB of archive trivialises early gates.
- **Granularity**: Fixed tiers (64 KB / 256 KB / 1 MB) vs. freeform slider?
- **UI placement**: Does this sit on the existing run-start screen, or does it open a separate "loadout" step?
- **Conversion rate**: 1:1 bytes from archive to storage, or a penalty rate (e.g. only 80% converts) to discourage hoarding purely for mechanical advantage?
- **Visibility**: Should the injected amount show up in the StorageBreakdown during the run so the player can see it separately from gate-earned storage?
- **Interaction with DVTD-annw**: If pre-selected configs also live on the run-start screen, this feature and that one need to share the same "loadout" surface — worth designing together.

## Related

- [[DVTD-enj5]] — the archive system this feature draws from; archive must exist and be credited correctly before injection makes sense.
- [[DVTD-annw]] — both features add pre-run decisions to the run-start screen; should be designed together to avoid a cluttered loadout step.
- [[DVTD-lwvx]] — parent epic for meta-progression.

## Decisions (2026-06-13)

- **Granularity**: Fixed tiers — 64 KB / 256 KB / 1024 KB
- **Cap**: Hard cap at 1 MB (top tier already equals the cap)
- **Conversion rate**: 1:1 (spend X archive → +X starting storage)
- **UI placement**: New 'loadout' step before run start (designed to also host [[DVTD-annw]] later)

## Todos

- [ ] Locate archived_storage source of truth and read path
- [ ] Locate run-start flow and how storage_limit is initialised
- [ ] Add loadout step route/component between new-run intent and run creation
- [ ] Tier selector UI (3 buttons + 0/skip) with archive balance + remaining preview
- [ ] Server: deduct archive + bump run.storage_limit atomically (single transaction)
- [ ] Validate tier ≤ player archive balance; reject otherwise
- [ ] Show injected amount in StorageBreakdown during run (separate line)
- [ ] Tests: factory + handler tests; insufficient-archive, cancel-after-select, atomicity
- [ ] Manual verify in dev

## Additional decisions (2026-06-13)

- **Insufficient archive**: Disable unaffordable tier buttons in the UI (greyed out with required-amount label). Server still validates as defence in depth.
- **Skippability**: Loadout step always shown; 'no inject' is the default selection so a fast-clicker isn't forced to think about it.
- **Atomicity**: Archive debit + run insert wrapped in a single `db.transaction`. Debit guarded with `WHERE archived_storage >= amount` so an under-funded debit returns 0 rows and the transaction aborts.


## Summary of work so far

**Schema**
- New column runs.injected_archive_bytes (integer, NOT NULL, default 0) — migration drizzle/0057_hard_retro_girl.sql
- Run model: added injectedArchiveBytes to DTO + factory + mock

**Server**
- debitArchivedStorageGuarded(userId, bytes, executor?) in archive.queries.ts — single atomic guarded UPDATE, accepts DbExecutor (db or tx). Returns null on insufficient archive.
- createRunForUser(userId, injectFromArchive?) debits first inside its tx, throws InsufficientArchiveError on insufficient funds, sets storage_limit = 1 MB + injection and injected_archive_bytes on insert.
- getOrCreateRun server fn switched to POST, accepts { injectFromArchive } validated via Zod.

**Constants**
- storageInjectionTiers.ts — tiers [64 KB, 256 KB, 1024 KB], helper isValidInjectionAmount reused by Zod validator.

**UI**
- /start: new loadout section with 4 tier buttons. Default no-inject. Unaffordable tiers disabled. Button label reflects selected boost.
- StorageBreakdown: new optional injectedArchive prop, renders amber line when > 0. Real callers wired.

**Verification**
- tsc --noEmit clean, lint clean.

## Todos remaining

- [ ] npm run db:push to apply migration in dev
- [ ] Manual verify
- [ ] Tests: insufficient-archive, atomicity, model field

## Test summary

New files:
- src/domains/economy/api/archive.queries.spec.ts — debitArchivedStorageGuarded (5 cases: happy path, insufficient archive returns null, bytes=0 no-op, negative no-op, missing user returns null)

Extended:
- src/domains/runs/api/queries.spec.ts — createRunForUser injection (no-debit when 0, debit+inject sets storage_limit and injected_archive_bytes, InsufficientArchiveError when debit returns null, transaction rollback when insert throws)
- src/domains/runs/api/handlers.spec.ts — updated assertion for new createRunForUser(userId, 0) signature

Full suite: 32 files, 399 passed, 6 skipped, 1 todo.
