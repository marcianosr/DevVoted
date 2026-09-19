---
# DVTD-ltci
title: 'Prep and the poll screen were unplayable: a NaN loop and a missing submit'
status: completed
type: bug
priority: critical
created_at: 2026-09-16T11:16:24Z
updated_at: 2026-09-16T11:16:24Z
parent: DVTD-0x5c
---

Two blockers found by playing the wired run.

**1. Every screen with a coverage bar died with "Too many re-renders".**
Every persisted `run_states.state` predates two renames: no `bankedUnits` at all, and `window.coverageGained` rather than `window.unitsEarned`. `toRunView` sums the two, so a hydrated run carried NaN coverage. `CoverageBar` settles its reading during render (`if (settled !== reading) setSettled(reading)`) and `NaN !== NaN`, so the comparison never converged and React bailed out with a blank screen.

Found by reading the local DB, not by reasoning: a run built with `createRun` has every field and never reproduces it.

**2. A single-answer poll had no way to submit.**
`liveFooterFor` returns `undefined` unless the poll is select-all, because the kanto option rows are keycaps and the press IS the answer. Wiring the screen with the old select-then-submit flow left a selection with no button to send it.

- [x] Heal pre-rename snapshots in `hydrateRunState` (`bankedUnits` reconstructed from `coverage - unitsEarned`, not defaulted to 0)
- [x] `hydrateRunState` takes `StoredSnapshot`: we write a `RunSnapshot` but read whatever wrote it
- [x] `clamped()` maps non-finite to 0 so no future NaN can loop a screen
- [x] `RunPoll` commits a single-answer poll on the press
- [x] Specs: 4 on the heal, 3 on the non-finite guard (they reproduce the exact React error), 2 on the poll interactions

## Summary of Changes

The snapshot heal is a reconstruction rather than a default: `coverage` has always been the run's running unit total, so zeroing `bankedUnits` would have wiped the score of every in-flight run. Run 66 (gate 4, 9.4 units) keeps its 9.4.
