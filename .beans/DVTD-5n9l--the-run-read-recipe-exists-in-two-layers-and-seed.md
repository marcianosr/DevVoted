---
# DVTD-5n9l
title: The run read recipe exists in two layers, and seed ordering is convention
status: completed
type: task
priority: normal
created_at: 2026-08-13T13:45:36Z
updated_at: 2026-08-13T16:10:29Z
parent: DVTD-82c4
---

Two friction points at the run application/infrastructure seam. Related to **DVTD-eyya** (split run.repository per read concern) — the interface should be settled first, then the split follows it.

## The three-call hydration recipe is written twice

```ts
// run.service.ts:46-50
const viewOfRun = async (run: SessionRunRecord): Promise<RunView> => {
  const snapshot = await fetchRunSnapshot(run.id);
  if (!snapshot) throw new Error("Run state not found");
  const polls = await fetchRunPollsForRun(run.id);
  return toRunView(hydrateRunState(snapshot, polls));
};

// run.repository.ts:593-600, inside the transaction
const polls = await fetchRunPollsForRun(args.runId, tx);
const state = hydrateRunState(stateRow.state, polls);
```

The application layer must know that a snapshot is not a `RunState`, that polls persist separately (ADR-009/011), and the correct hydration order. `run.repository.ts` exports 13 symbols; `run.service.ts` imports all 13.

## "Seed the day before you dispatch" is enforced by comment

Three call sites (`run.service.ts:57`, `:112`, `:154`), each carrying the same explanation:

```ts
// Materialize today's shared sequence before the dispatch transaction
// rolls the run over to it.
await getOrCreateDailyRunSeed(date);
await applyActionToRun({ ... });
```

`ensureTodaysSegmentWith` (repository:394) reads `fetchSeedPollIds(tx, today)` and **silently no-ops when the seed is missing** (`if (fresh.length === 0) return`). Forgetting the call produces no error. `run.service.spec.ts:95` and `:293` assert only that it *was* called, never the order.

## Todo

- [x] Add `loadRunState(runId)`; the service stops assembling snapshot + polls + hydrate
- [x] Moved into all three readers of the day sequence, not just dispatch
- [x] Delete the three ordering comments once the interface enforces them
- [~] Net-neutral: `fetchRunPollsForRun` left the service's imports, `loadRunState` joined. DVTD-eyya still worth doing

## Summary of Changes

### One call to load a run

`loadRunState(runId)` in the repository does snapshot → polls → hydrate. `viewOfRun` collapses from six lines to one, and the application layer no longer needs to know that a snapshot is not a `RunState`, that polls live in a separate table (ADR-009), or which order to join them in. `run.service.ts` dropped its `hydrateRunState` and `fetchRunPollsForRun` imports entirely.

### The seed rule moved to the readers

It was enforced by comment at three service call sites, and forgetting it failed **silently** — `ensureTodaysSegmentWith` reads `fetchSeedPollIds` and returns early on an empty result, so a missing seed reads as "nothing to roll over" rather than an error.

Now every reader of today's shared sequence materializes it first:

- `ensureTodaysSegment`
- `applyActionToRun`
- `fetchRunPollsForDate` (the start-a-run path, which reads the sequence directly)

**Placement mattered.** The seed opens its own transaction, so calling it *inside* the `run_states FOR UPDATE` block would invert the lock order — seed-then-run everywhere becomes run-then-seed there. Both calls sit immediately before `db.transaction`, preserving the ordering the service used to achieve by convention. That is written down at both sites, because it is the kind of thing a later reader would "tidy" into the transaction.

`run.service.ts` no longer imports `getOrCreateDailyRunSeed` at all, and the three explanatory comments went with it.

### Tests

The spec changes are the clearest evidence the seam moved:

- `run.service.spec.ts` stopped mocking `fetchRunPollsForRun` and stopped asserting `getOrCreateDailyRunSeed` was called — neither is the service's business now. It mocks `loadRunState` instead, which is a single stub where there were two.
- `run.repository.spec.ts`'s `dispatch` helper primes one extra query result, since `applyActionToRun` now answers the seed lookup before taking the lock. A non-empty result short-circuits `getOrCreateDailyRunSeed` and leaves the queue aligned.

`fetchRunSnapshot` stays in the service for `findResumableRun`, which asks whether a state row *exists* (the corrupt-run self-heal) rather than hydrating it — a different question, correctly still its own call.

Verified: tsc 0 errors, oxlint clean, depcruise 0 violations (531 modules), 1473 tests passing.
