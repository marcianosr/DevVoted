---
# DVTD-4zqc
title: The bands are cut in answers and widen with the climb; the floor rule is wired (ADR-094)
status: completed
type: feature
priority: normal
created_at: 2026-09-21T12:31:03Z
updated_at: 2026-09-21T12:54:40Z
---

Design session 2026-09-21. The first three gates were pre-decided (Pallet HEALTHY at 1 of 5; a cleared Pallet already OK at Boulder), OK and SHAKY shrank on the bar from 20% to 3% by the summit, and a player who filled the bar yesterday was HEALTHY before answering at every gate.

Decisions: Pallet holds, never kills (four bands); every gate from Boulder draws five; HEALTHY at Pallet is 3 of 5; the floor is where HEALTHY stood yesterday; OK widens from one answer under the line to three; the `FLOOR_CORRECT` rule (2 of today's 5 or the gate holds) is wired and a hold names its reason. Plan: ~/.claude-work/plans/elegant-nibbling-axolotl.md

## Todo

- [x] `GATE_RUNGS` table in units + invariant specs; Monte-Carlo re-pinned with observed rates (bare 60%: <1%, bare 70%: ~4%)
- [x] number-tracking specs and fixtures moved (kantoGate OK/SHAKY totals, NextGate, ShopScreen, runHistory, answer.model, GateOutcomeView; Lavender prep build gained agentsMd so OK lands in under five answers)
- [x] `gateRulingFor` with the floor rule; the two red floor specs green
- [x] `heldBy` recorded at the close, cleared on the clear and the retry
- [x] `heldBy` on GatePayout and the debrief frame; floor hold keeps the honest bar and says "1 of 5 right, 2 needed"
- [x] prep clear objective met only with line and floor; explain copy ("the day still owes 2 right answers")
- [x] stories: GateOutcomeScreen HeldByFloor (fixture gained `openingHeld`), PrepScreen SecondGate, RunOverScreen FirstGate bar
- [x] ADR-094 (093 was taken mid-session by DVTD-gypj) + amendments to 057/073/075/076 + README index
- [x] wiki §2.6 / 2.7 / 2.8 / 8 / 10
- [x] CHANGELOG
- [x] tsc, lint, prettier, full test run (214 files, 3908 passed, 0 failed), storybook eyeball of Pallet/Boulder/Champion prep and the floor-held debrief

## Summary of Changes

- `coverageRatio.model.ts`: `HEALTHY_LADDER`, `OK_DROP_UNITS`, `SHAKY_DROP_UNITS` replaced by `GATE_RUNGS` (one `{healthy, okDrop}` row per gate in units), `floorUnitsAt(g) = healthyUnitsAt(g-1)` (0 at Pallet); `okAt` collapse and `floorAt` clamp removed, invariants pinned in the spec instead. Pallet 0/40/60, Boulder 30/50/60, Champion 80/85.4/90.
- `gate.model.ts`: `gateRulingFor` (bare → DANGER fatal → floor held → SHAKY held → cleared) with `GateHoldReason`; `gateClosingFor` kept as a thin wrapper. The two red floor specs are green.
- `answer.model.ts` / `run.model.ts` / `strip.model.ts`: `RunState.heldBy` written at the close, cleared on the clear and the retry; floor log line `Gate N failed: 1 of 5 right, 2 needed.`
- `gatePayout.viewmodel.ts` → `GateOutcomeView.component.tsx` → `gateOutcome.viewmodel.ts`: `heldBy` reaches the debrief; `bandOf` reads SHAKY for a floor hold, `closedBarFor` skips the clamp, subtitle and coverage badge say the day count.
- `bandOutcomes.viewmodel.ts`: clear objective met only with line + `FLOOR_CORRECT`; explain never quotes fewer answers than the floor; in-hand copy `the day still owes 2 right answers`.
- Specs: invariants replace old-rule pins; Monte-Carlo re-pinned (bare 60% < 1%, bare 70% < 5%); number-tracking literals moved; Lavender prep fixture gained agentsMd; gate fixture gained `openingHeld`. New stories `HeldByFloor`, `SecondGate`.
- Docs: ADR-094, amendments to 057/073/075/076, README, wiki §2.6/2.7/2.8/8/10, CHANGELOG.

Observed, not fixed: prep pays quote from zero and saturate at five answers (Boulder bare build reads +64 KB on OK, HEALTHY and PERFECT); rung marks collide at the summit (80/85.4/90); `LedgerRows` keys figures by label so `[4,5,6,5,6]` option counts warn about duplicate keys (pre-existing); `+0 B peel` at Pallet.
