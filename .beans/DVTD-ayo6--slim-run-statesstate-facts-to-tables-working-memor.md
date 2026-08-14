---
# DVTD-ayo6
title: 'Slim run_states.state: facts to tables, working memory stays blob'
status: todo
type: task
priority: deferred
created_at: 2026-07-25T14:14:50Z
updated_at: 2026-07-27T14:17:00Z
parent: DVTD-615s
---

The snapshot blob (>10KB at gate 3) persists three kinds of data; only one belongs there. Split decided 2026-07-25 (session w/ Claude), parked as deliberate debt — piggyback on the next engine_version bump, not a standalone project.

## The split
- FACTS → existing tables: per-answer scoring moves to polls_responses.coverage_delta + score_breakdown (columns already reserved, currently null for session rows). answeredThisGate/allAnswered entries slim to {pollId, outcome, pickedOptionIds, coverageEarned, coverageBreakdown}; toRunView resolves labels from hydrated polls (fetchRunPollsForRun already joins full content every load).
- WORKING MEMORY → stays in the blob, slimmed: window, streak, storage, draft state, configs as {id, level} refs rehydrated from the roster (CONFIGS).
- DELETE: state.log — persisted + grown every dispatch, rendered nowhere.
- Bump engine_version to 2; hydrateRunState keeps a v1 fallback (same optional-field pattern as allAnswered).
- Migrate column json → jsonb while at it.

## Design decision folded in
Config refs mean live rebalances PROPAGATE to in-flight runs (today they're frozen copies by serialization accident). Marciano leaning propagate; deserves an ADR line when implemented.

## Why deferred
Nothing is broken — TOAST absorbs the size; it's a compounding tax (~2KB/poll answered, whole blob rewritten per action), not a fire. Multi-day runs (ADR-014) make blobs grow to ~40-50KB over a long run.
