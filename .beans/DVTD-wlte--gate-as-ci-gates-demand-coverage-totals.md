---
# DVTD-wlte
title: 'Gate-as-CI: gates demand coverage totals'
status: completed
type: feature
priority: normal
created_at: 2026-08-15T06:51:49Z
updated_at: 2026-08-17T09:51:15Z
parent: DVTD-kulw
---

Redesign (session 2026-08-14/15, Marciano): each gate demands a run-total coverage threshold alongside its config checks and width demand. Coverage under threshold = fail = strip + redo the same gate, routed through the shop. Gates grant slots (coverage slot ladder deleted, reverses ADR-019). Design record: docs/adr/034-the-gate-is-a-ci-run.md.

## Todo

- [x] Draft ADR-034 (pass contract, scaled loss, threshold rule + table, shop-on-redo, slot merge, laps display, check retargets; open: pollsExhausted camping, coverageGain retarget, gate-0 threshold)
- [x] Add amendment pointers to ADR-008/013/019/025/027 and the README index
- [x] rules.model.ts: coverageDemandFor per gate + WRONG_COVERAGE_LOSS halved to 0.25
- [x] gate.model.ts: coverage total joins gatePassed (defaults to 0: forgetful callers starve)
- [x] pipeline.model.ts: delete SLOT_COVERAGE_GATE / coverageToAddSlot / canAddSlot; slotsForGatesCleared + nextSlotGateFor
- [x] Redo flow: fail -> strip -> shop -> prep -> replay (resume-climb enters rewarding with redoGate set; ADR-031 door guards replays)
- [x] ~~Retarget coverageGain config's check~~ moot: ADR-035 removes checks from configs entirely
- [x] HUD: coverage laps (coverageLapFor; plain % on lap 1, name + remainder after)
- [x] Wiki 2.10 + 3.1 rewrite (three axes -> two), gate fail-flow prose, constants table; two changelog entries

## Progress note (2026-08-15)

Implemented and verified: tsc clean, 1595 tests passing (120 files), oxlint + dependency-cruiser clean. The one unchecked item (coverageGain retarget) is ADR-034 open question 2 and a call for Marciano; the config still works today, its +1% check is just near-free under thresholds. Also open in the ADR: pollsExhausted while camping (defaults to the ADR-032 countdown) and gate 0 at 3% vs a teaching-gate exemption.

## Summary of Changes

ADR-034 shipped and ran live. Superseded 2026-08-17 by the gates-are-auditors redesign (ADR-035): cumulative coverage totals become per-gate fresh demands, strip-on-fail becomes free redo, checks leave configs. See the successor beans under DVTD-kulw.
