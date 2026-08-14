---
# DVTD-ay5e
title: 'session-run server layer: engine as authority + client-safe DTOs + persistence'
status: completed
type: feature
priority: normal
created_at: 2026-07-12T09:18:31Z
updated_at: 2026-07-17T12:40:34Z
parent: DVTD-5jpw
blocking:
    - DVTD-08ve
---

The trust boundary (ADR-005 container / realizes part of DVTD-kg2e). Server functions (createServerFn) own run state: load the real poll (server holds correctness), run the pure session-run engine as AUTHORITY, persist to Drizzle (runsTable mode='session'), return a REDACTED client view. Key: split poll type — server Poll (has correct) vs client PollView (no correct); answer submission sends optionId, server judges. Anti-cheat: never trust client-provided storage/gatesCleared/coverage. Blocks the route wiring.

## Progress (core, decision-free)
- Engine now judges single + multiple: answer takes optionIds[]; isCorrect() judges by answerType (single = the correct option; multiple = exact correct set). SessionPoll gains answerType.
- Client-safe view: src/modules/session-run/view/sessionView.ts — toSessionView(state) redacts option correctness, exposes only the current poll, surfaces checks/demands/stats. Tested (no correct leak).
- 99 tests, tsc + oxlint clean.

## Remaining (the TanStack Start integration — needs decisions/infra)
- Persistence: ~~session_state column~~ superseded 2026-07-17 → 1:1 run_states satellite table (see ADR-005 addendum).
- Poll supply (ADR-005 open q): which practice-bank polls + ordering. Default proposal: random N from the bank.
- Server functions (createServerFn): auth (getAuthenticatedUserId) → load state → sessionReducer → persist → return toSessionView. Then Bean 4 wires the route.

## Slice plan (approved 2026-07-17)

Plan file: BE persistence via satellite run_states table (1:1 runs), daily_run_seeds/daily_run_polls shared seed tables, seed_date on runs. Decisions: mode columns suffice (no marker table); per-answer polls_responses rows deferred to slice 2 (constraint split); leftover KB credits users.archived_storage at run end.

### Slice 1 todos
- [x] Schema: run_states, daily_run_seeds, daily_run_polls, runs.seed_date + partial unique
- [x] Guarded SQL migrations (supabase/migrations): daily_run_seeds, run_states
- [x] climb/runSnapshot.model.ts codec (toRunSnapshot/hydrateRunState) + spec
- [x] services/seed.service.ts (mulberry32, SEED_LENGTH=50) + spec
- [x] validation/schemas.validation.ts (RunAction zod union) + spec
- [x] api/queries.ts (seed getOrCreate, hydration, run_states CRUD, finish + archived_storage credit) + spec
- [x] api/handlers.ts (dispatch flow, redaction) + spec
- [x] api/run.ts server functions (getTodaysRun, startRun, dispatchRunAction)
- [x] ADR note: run_states satellite table + economy bridge
- [x] lint + typecheck + build + tests green

## Summary of Changes

Slice 1 (persist + resume) shipped 2026-07-17:

- **Schema** (`src/database/schema.ts`): `run_states` 1:1 satellite (RunSnapshot blob + denormalized engine_status/gates_cleared/coverage/polls_answered + engine_version), `daily_run_seeds` + `daily_run_polls` (persisted shared seed, ON DELETE RESTRICT), `runs.seed_date` + partial unique `(user_id, seed_date) WHERE mode='session'`. Guarded SQL in `supabase/migrations/20260717*.sql` — all additive, calendar data untouched.
- **Server layer** (`src/modules/run/`): `climb/runSnapshot.model.ts` codec (blob excludes polls; rehydrated from the seed tables), `services/seed.service.ts` (xmur3+mulberry32 Fisher-Yates, SEED_LENGTH=50), `validation/schemas.validation.ts` (strict zod discriminated union — intent only, no state fields), `api/queries.ts` (race-safe seed getOrCreate, FOR UPDATE dispatch transaction, finish + archived_storage credit), `api/handlers.ts`, `api/run.ts` (getTodaysRun/startRun/dispatchRunAction; idempotent start).
- **Economy bridge (decided)**: leftover storage KB → users.archived_storage bytes at won/dead.
- **Redaction**: only toRunView leaves the server; handler spec has a no-correct-key tripwire.
- ADR-005 addendum + ADR-009 fuel-bullet note recorded. 93 test files / 758 tests, lint+arch, build all green.

Deferred to follow-up beans: per-answer polls_responses rows + constraint split (slice 2), leaderboard rows at finish (slice 3), route wiring (DVTD-08ve).
