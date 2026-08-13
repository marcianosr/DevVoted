---
# DVTD-rn26
title: The community board reads run state with hand-written SQL JSON paths
status: todo
type: task
created_at: 2026-08-13T13:45:36Z
updated_at: 2026-08-13T13:45:36Z
parent: DVTD-82c4
---

`community/infrastructure/climbers.repository.ts` (172 lines, **no spec**) reaches into the run-state blob from a different aggregate, in raw SQL:

```
:19  ${runStatesTable.state}->'window'->>'answered'
:23  ${runStatesTable.gates_cleared} * ${SLICE_WINDOW} + coalesce((...->'window'->>'answered')::int, 0)
:95  json_array_length(${runStatesTable.state}->'pipeline'->'configs')
:96  json_agg(entry->>'outcome') from json_array_elements(${...state}->'allAnswered')
:101 (${runStatesTable.state}->>'streak')::int
```

Rename `RunState.window.answered`, `allAnswered`, `streak`, or `AnsweredPoll.outcome` and this compiles clean and returns `0` / `[]`. Every path is `coalesce`d, so the failure is invisible.

"How to read a run state" currently lives in four places: `run.model.ts` (TS), `run.repository.ts` (denormalized writes), `climbers.repository.ts` (5 SQL paths), `community.repository.ts` (the `polls_answered` column, whose "mirrors `currentIndex`" invariant is maintained at two write sites, run.repository.ts:336 and :631).

## trackPosition is pinned by a copy of itself

`climbMap.model.spec.ts:56-71` asserts:

```ts
expect(trackPosition({ gate, pollsIntoGate: polls })).toBe(gate * SLICE_WINDOW + polls);
```

The assertion restates the implementation, so it cannot fail for the reason the spec block says it exists ("pins the formula so a change here fails loudly"). The real consumer — `fetchPersonalBestPosition`'s `max(position)` and the day-boundary arithmetic in `fetchFallenToday` — has no test at all.

## Todo

- [ ] Add a run-state SQL projection owned by run's infrastructure (typed accessors keyed off `RunSnapshot`, or generated columns)
- [ ] Point `climbers.repository` and `community.repository` at it
- [ ] Delete the self-pinning spec block; test the position reads that actually run
- [ ] Add a spec for `climbers.repository`
