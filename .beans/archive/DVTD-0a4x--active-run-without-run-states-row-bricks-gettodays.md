---
# DVTD-0a4x
title: active run without run_states row bricks getTodaysRun
status: completed
type: bug
priority: normal
created_at: 2026-07-18T20:30:12Z
updated_at: 2026-07-18T20:32:36Z
---

Run 64 (dev): runs row + run_polls exist, run_states row missing (cause unknown — created 08:55 via startRun; insert is transactional, likely mid-refactor dev-server state). Every getTodaysRun/startRun throws 'Run state not found' → player stuck on 'Something broke'. Fix: handlers finalize a state-less active run as abandoned (0 credit) and fall through to the start screen; abandonSessionRun tolerates a missing state row; getTodaysRun only surfaces finished runs with completion_reason victory|dead.

## Summary of Changes

- abandonSessionRun tolerates a missing run_states row: still finishes the run as abandoned, credits 0 (leftover unknown).
- New findResumableRun in handlers: an active run without a snapshot is self-healed (abandoned, 0 credit) and treated as no-active-run — getTodaysRun/startRun fall through to the start screen / fresh start instead of failing forever.
- getTodaysRun only surfaces a finished run's summary when completion_reason is victory|dead (isFinishedRun); abandoned/corrupt runs show the start screen.
- Root cause of run 64's missing state row not reproducible (createSessionRunWithState is transactional; likely a mid-refactor dev-server state at 08:55). Self-heal makes the whole class harmless.
- 793 tests green (3 adjusted/new), lint+arch, build clean.
