---
# DVTD-ay5e
title: 'session-run server layer: engine as authority + client-safe DTOs + persistence'
status: todo
type: feature
priority: normal
created_at: 2026-07-12T09:18:31Z
updated_at: 2026-07-12T13:07:30Z
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
- Persistence: store SessionState (plain JSON) on a session_state json column (runsTable mode='session') — additive migration.
- Poll supply (ADR-005 open q): which practice-bank polls + ordering. Default proposal: random N from the bank.
- Server functions (createServerFn): auth (getAuthenticatedUserId) → load state → sessionReducer → persist → return toSessionView. Then Bean 4 wires the route.
