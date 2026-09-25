---
# DVTD-0x5c
title: Wire proto-run to the backend
status: completed
type: epic
priority: critical
created_at: 2026-09-15T14:13:45Z
updated_at: 2026-09-24T18:21:18Z
parent: DVTD-u35m
---

**What:** Point the prototype run screens at the real server-backed engine.

**Why:** The prototype already runs the same engine over local state, so only the wiring is missing.

## Notes

The engine is already server-authoritative and persisted (`run_states`, `applyActionToRun`, `dispatchRunAction`). proto-run is a local `useState` over the same `runReducer`, rendering the same `RunView` the server returns.

What is left is presentation wiring plus four concrete gaps. No new engine work.
