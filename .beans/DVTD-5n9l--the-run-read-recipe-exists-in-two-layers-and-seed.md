---
# DVTD-5n9l
title: The run read recipe exists in two layers, and seed ordering is convention
status: todo
type: task
created_at: 2026-08-13T13:45:36Z
updated_at: 2026-08-13T13:45:36Z
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

- [ ] Add `loadRunState(runId)`; the service stops assembling snapshot + polls + hydrate
- [ ] Move `getOrCreateDailyRunSeed` inside the dispatch path so the ordering cannot be skipped
- [ ] Delete the three ordering comments once the interface enforces them
- [ ] Narrow the repository's export surface; then revisit DVTD-eyya
