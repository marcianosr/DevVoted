---
# DVTD-ay5e
title: 'session-run server layer: engine as authority + client-safe DTOs + persistence'
status: todo
type: feature
priority: normal
created_at: 2026-07-12T09:18:31Z
updated_at: 2026-07-12T09:18:32Z
parent: DVTD-5jpw
blocking:
    - DVTD-08ve
---

The trust boundary (ADR-005 container / realizes part of DVTD-kg2e). Server functions (createServerFn) own run state: load the real poll (server holds correctness), run the pure session-run engine as AUTHORITY, persist to Drizzle (runsTable mode='session'), return a REDACTED client view. Key: split poll type — server Poll (has correct) vs client PollView (no correct); answer submission sends optionId, server judges. Anti-cheat: never trust client-provided storage/gatesCleared/coverage. Blocks the route wiring.
