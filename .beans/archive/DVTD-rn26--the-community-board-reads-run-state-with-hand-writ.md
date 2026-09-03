---
# DVTD-rn26
title: The community board reads run state with hand-written SQL JSON paths
status: completed
type: task
priority: normal
created_at: 2026-08-13T13:45:36Z
updated_at: 2026-08-13T16:15:31Z
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

- [~] Solved by binding, not by projection — see "Why not a projection"
- [~] Not applicable under the chosen fix; the paths stay where they are, now type-bound
- [x] Deleted the self-pinning block; replaced with outcome-stating tests
- [x] Added — covering the day-boundary arithmetic, the part a spec can actually reach

## Summary of Changes

### A rename is now a compile error

The five JSON paths stay in SQL, but their key names come from the types that own them:

```ts
const stateKey = <K extends keyof RunSnapshot>(key: K) => sql.raw(`'${key}'`);
const windowKey = <K extends keyof GateWindow>(key: K) => sql.raw(...);
const pipelineKey = <K extends keyof Pipeline>(key: K) => sql.raw(...);
const answeredKey = <K extends keyof AnsweredPoll>(key: K) => sql.raw(...);
```

so `${runStatesTable.state}->${stateKey("window")}->>${windowKey("answered")}` replaces the hand-typed `->'window'->>'answered'`.

**Verified by mutation**: renaming `RunState.streak` to `streakCount` now fails `tsc` inside `climbers.repository.ts`, where before it compiled clean and returned `coalesce(..., 0)` — a zero that reads as "no streak" rather than an error.

`sql.raw` is safe here precisely because the argument cannot be anything but a key of the type: there is no runtime input, so nothing to inject.

### Why not a projection

The bean asked for a typed projection or generated columns. I did not do that, and the reason is worth recording: **this is the one area whose behaviour the test suite cannot execute.** There is no Postgres in the unit run, so a rewrite of five aggregate queries would be verified by reading alone, on the queries that draw the community board. The binding approach closes the actual failure mode named in the title — silent renames — while leaving the generated SQL byte-identical by construction, since `sql.raw` splices exactly the characters that were there before.

A projection remains the better end state if these queries grow. It wants a database in the test loop first.

### The self-pinning spec

`climbMap.model.spec.ts` asserted `trackPosition(x) === gate * SLICE_WINDOW + polls` — the implementation retyped, so it could never fail for the reason its comment gave. Replaced with five tests that state answers outright (0, 3, 5, 20), bound the last gate inside `TRACK_LENGTH`, and check a climb never moves backwards.

Worth noting for whoever revisits: the SQL `position` fragment already interpolates the same `SLICE_WINDOW` constant, so the tunable is genuinely shared — only the arithmetic shape is written twice, which is inherent to doing the aggregate in SQL.

### First spec for the file

`localDayRange(date)` extracted from `fetchFallenToday` and covered: midnight-to-midnight, **local rather than UTC** (the seed date is the player's calendar day, and parsing without the time would shift late-evening deaths onto the wrong day), month-end rollover, and a leap day. The rest of the file is query construction that needs a database to say anything about.

Verified: tsc 0 errors, oxlint clean, depcruise 0 violations (532 modules), 1478 tests passing.
