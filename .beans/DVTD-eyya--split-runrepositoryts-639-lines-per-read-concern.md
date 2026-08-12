---
# DVTD-eyya
title: Split run.repository.ts (639 lines) per read concern
status: todo
type: task
priority: low
created_at: 2026-08-12T19:52:14Z
updated_at: 2026-08-12T19:52:14Z
---

Deferred from DVTD-36ct. run/infrastructure/run.repository.ts holds the write path plus every read. The write path (applyActionToRun: one SELECT FOR UPDATE, one reducer, one write) must stay a single transaction in one file — split only the reads (today's-run lookup, snapshot hydration, history) into repositories per concern.

## Todo
- [ ] Map the read call sites and group per concern
- [ ] Extract read repositories; write path stays untouched in run.repository.ts
- [ ] lint:arch still clean; no new cross-aggregate imports
