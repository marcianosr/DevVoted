---
# DVTD-mkhg
title: Rebase reorder does not survive the transaction
status: completed
type: bug
priority: normal
created_at: 2026-09-06T12:14:54Z
updated_at: 2026-09-15T12:25:36Z
parent: DVTD-7g3w
---

`rebase()` only rewrites `state.polls` (rebase.model.ts), which is exactly the field `toRunSnapshot` drops, and `run_polls.position` is never updated — so a committed reorder is served in the ORIGINAL order on the next dispatch. The drag is server-side cosmetic beyond one request.

Found 2026-09-06 while building DVTD-clgs. The gates-reordered objective counter deliberately rides the persisted `rebasedThisGate` flag (set by rebase, cleared by the landing answer), NOT the order — so counting stays correct whether or not this is fixed, and the counting design needs no change when it is.

Fix sketch: persist the reordered slice into `run_polls.position` inside `applyActionToRun` when the action is `rebase` (the tx already holds the state-row lock), or rehydrate order from a persisted permutation.

Fixed by DVTD-7g3w: rewriteRunPollOrder in runPolls.repository, called from applyActionToRun on a rebase action. Positions held fixed, poll_id reassigned (the unique constraint rules out moving rows). Regression test in run.repository.spec verified red without the call.
