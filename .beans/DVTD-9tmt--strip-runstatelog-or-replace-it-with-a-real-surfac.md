---
# DVTD-9tmt
title: Strip RunState.log, or replace it with a real surface
status: todo
type: task
priority: low
created_at: 2026-08-25T13:27:18Z
updated_at: 2026-08-25T13:27:18Z
---

RunState.log builds strings in almost every transition (withLog, clearLine, and log lines threaded through answer/closeWindow/strip/draft/upgrade/sell/plantPin/changePlan/...) but the run log never renders in the live game.

Removing it would shrink run.model.ts noticeably and delete a parameter from most transitions. Deliberately kept out of the DVTD-hg7v move refactor because it is a behaviour change and it touches the persisted snapshot shape (RunSnapshot = Omit<RunState, "polls">, so `log` is in run_states.state).

## Todo
- [ ] Confirm nothing reads state.log (server, admin, debug routes, proto-run)
- [ ] Decide: delete outright, or keep a small typed event list for the reward screen / badges
- [ ] Migration for existing run_states.state rows if the field is dropped
