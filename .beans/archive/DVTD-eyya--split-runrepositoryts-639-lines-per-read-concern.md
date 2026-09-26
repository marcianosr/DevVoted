---
# DVTD-eyya
title: Split run.repository.ts (639 lines) per read concern
status: completed
type: task
priority: low
created_at: 2026-08-12T19:52:14Z
updated_at: 2026-08-13T17:45:53Z
---

Deferred from DVTD-36ct. run/infrastructure/run.repository.ts holds the write path plus every read. The write path (applyActionToRun: one SELECT FOR UPDATE, one reducer, one write) must stay a single transaction in one file — split only the reads (today's-run lookup, snapshot hydration, history) into repositories per concern.

## Todo
- [x] Map the read call sites and group per concern
- [x] Extract the poll-sequence repository; write path stays untouched in run.repository.ts
- [x] lint:arch still clean; no new cross-aggregate imports

## Summary of Changes

`run.repository.ts` 639 → 419 lines, with `runPolls.repository.ts` (289) taking
the poll-sequence half.

### The cut is by table, not by read-versus-write

The bean proposed splitting only the reads. That line does not exist here: the
day rollover *reads* today's seed and *writes* the run's tail, in the same
function, and it is the single largest piece of `run_polls` knowledge in the
file. Splitting reads from writes would have left `run_polls` statements in both
files, which is the thing that makes a repository hard to reason about.

So the seam is table ownership:

- **`runPolls.repository.ts`** — `daily_run_seeds`, `daily_run_polls`,
  `run_polls`. `getOrCreateDailyRunSeed`, `fetchRunPollsForDate`,
  `fetchRunPollsForRun`, `insertRunPolls`, `rollSegmentForward` (was the private
  `ensureTodaysSegmentWith`), plus the poll hydration helpers.
- **`run.repository.ts`** — `runs`, `run_states`, `poll_responses`, `users`. The
  lookups, the snapshot, and the whole dispatch transaction.

Everything that must join the caller's transaction takes a `reader`/`tx`, which
several of them already did. `applyActionToRun` is untouched: it still seeds
before the lock, opens one `db.transaction`, and hands that `tx` to
`rollSegmentForward`. Taking the `run_states` lock stays in `run.repository`,
because `run_states` is its table.

### Stopped at two files

A third file for the plain lookups (`findActiveSessionRun`,
`findSessionRunByDate`, `fetchAnsweredPollIdsForDay`, `fetchOwnedSwatchIds`) was
considered and rejected: they read four different tables and share nothing but
size. It would fail the deletion test — the complexity would move, not
concentrate.

`fetchOwnedSwatchIds` reads a `collection` concern out of `users`, so it
arguably belongs in `collection/`. Left alone: its writer (`awardGateSwatch`)
sits inside the dispatch transaction, and separating a reader from its writer
across contexts is a worse trade than the one it fixes.

### Tests

`getOrCreateDailyRunSeed`'s four tests moved to a new
`runPolls.repository.spec.ts`, following their subject. That gave the 87-line
chainable-Drizzle mock a second consumer, so it moved to
`~/test/drizzleMock.factory.ts` (`createMockDb`, `resetDrizzleMock`) instead of
being copied. The state object stays declared per-spec via `vi.hoisted`, which a
`vi.mock` factory is allowed to close over; the factory reaches the helper by
dynamic import.

### Also

- Three dead `getOrCreateDailyRunSeed` mock lines in `run.service.spec.ts` — the
  service stopped calling it when DVTD-5n9l moved seeding into the readers.
- CONTEXT.md gained a "Poll sequence" row.

### Verification

1480 passing across 118 files (was 117), tsc clean, oxlint clean,
dependency-cruiser 0 violations across 536 modules.
