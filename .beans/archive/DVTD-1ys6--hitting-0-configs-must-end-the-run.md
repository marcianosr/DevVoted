---
# DVTD-1ys6
title: Hitting 0 configs must end the run
status: completed
type: bug
priority: high
created_at: 2026-08-07T13:03:18Z
updated_at: 2026-08-07T13:12:29Z
---

The AnsweringScreen already promises "a fail peels all N — run over" when the strip
quota meets the build (`StakeOnFailure`, ADR-017 reasoning), but the reducer strips the
build bare and keeps playing: `closeWindow` caps `toDrop` at `configs.length`, so the
player peels everything, `resumeClimb` sets status "answering" with an empty pipeline,
and death only lands one gate later (a bare pipeline can never clear — ADR-017).

Fix: a failed gate whose peel quota meets or exceeds the installed configs ends the run
immediately. That subsumes the old `isBare` special case and removes the zombie window.
Also close the shop path to a bare pipeline (sell/drop of the last config) so 0 configs
is unreachable rather than differently fatal.

## Todo
- [x] `closeWindow`: quota >= held → dead (replaces the isBare branch)
- [x] `sell`/`drop`: refuse to leave the pipeline bare
- [x] Shop UI: disable Deinstall on the last config with a reason
- [x] Tests for both paths
- [x] ADR for the mechanic change (supersedes ADR-006 §fail, ADR-014 §3)
- [x] Update ADR-006 / ADR-014 / wiki.md loss-model copy
- [x] CHANGELOG entry

## Summary of Changes

- `climb/run.model.ts`: `closeWindow` kills the run when `dropCount(gatesCleared) >= pipeline.configs.length` (no strip screen, no partial peel); the old `isBare` special case is subsumed. `resumeClimb` refuses to climb on with an empty pipeline (guards pre-ADR-021 snapshots). `sell`/`drop` refuse the last installed config (`holdsLastConfig`).
- `presentation/screens/ShopScreen.ui.tsx`: Deinstall disabled on a one-config load-out, with a tooltip naming the reason.
- Tests: quota-takes-the-build death, survivable-peel invariant (`stripsRemaining < configs.length`), bare-resume death, last-config sell refusal, shop button lock. Suite: 1256 pass, tsc clean, lint + dep-cruiser clean.
- Docs: new ADR-021, supersession markers in ADR-006 §6 / ADR-014 §3, ADR index rows, wiki outcome table + fragility/managing-configs copy, CHANGELOG bullet.

Not touched: `src/domains/runs/prototype/sessionRun.ts` still carries the old capped-peel logic (the `/proto-run` prototype route). Follow-up question for Marciano.
