---
# DVTD-zjeq
title: 'Gates are auditors: checks off configs, per-gate coverage, free redo'
status: completed
type: feature
priority: normal
created_at: 2026-08-17T09:51:42Z
updated_at: 2026-08-17T11:21:55Z
parent: DVTD-kulw
---

Phase A of the ADR-035 redesign. Configs become pure enhancements (Effect only; ADR-016/017/022/033 superseded). Each gate demands a fresh coverage total earned inside its own 5-poll window (window.coverageGained becomes a net meter). Failing a gate = free redo: same gate, fresh polls, no strip, no death, no shop detour. Width demand / blocked shop exit / End-run click deleted (ADR-027/031 dead). Strip/death plumbing kept dormant for Phase B strip audits. Volkswagen CI leaves the roster (returns Phase B as audit suppressor).

## Todo

- [x] Domain surgery: effect/config/configRoster/gate/rules/pipeline/configRole/gateReward models
- [x] run.model.ts: net window meter, free-redo fail branch, delete width-death (+ bare-pipeline death guard kept for legacy snapshots)
- [x] Per-gate COVERAGE_DEMANDS table [3,10,25,40,60,85,110,140,175,210,250,290,340] (Marciano tunes the curve)
- [x] Viewmodel + UI rework (GateStakeReceipt, RunHud gate meter, checks props gone, End-run gone, .length answer-count line)
- [x] Stories + specs rewritten; invariant inverts (no config demands anything)
- [x] ADR-035 + supersession markers (016/017/019/021/022/027/028/031/033/034; amend 006/013) + README index row
- [x] wiki.md sections 2.2/2.5/2.6/2.7/2.8/2.9/2.10/4.1/4.3/4.4/4.5/4.6/5.1/5.2 + glossary + numbers appendix
- [x] CHANGELOG entry (gates audit you now, failing is free)
- [x] npm test (1489 passed) / lint (oxlint + depcruise) / build (vite + tsc) green

## Summary of Changes

Phase A of ADR-035, shipped 2026-08-17 in one pass with Phases B (DVTD-gre4) and C (DVTD-taxo).

- Checks deleted end to end: CheckKind/CheckStatus/all nine builders, the synthesized Correct row, the defeat device's checklist reader, mastery checks, RosterConfig's type enforcement, configRole's requirement tier, gateReward's check rows, RoleList/PipelineReportRow progress rendering, the checks prop on every screen.
- gatePassed = !isBare && window.coverageGained >= per-gate demand. window.coverageGained is the net meter (losses subtract, floored at 0), reset by freshWindow at start/pass/redo; career coverage untouched.
- COVERAGE_DEMANDS -> [3,10,25,40,60,85,110,140,175,210,250,290,340] per gate; fail = free redo (fresh polls, redoGate set, bill still charged); width demand/blocked exit/End-run deleted; sell-drop floor = 1 config; bare legacy snapshots die instead of soft-locking; laps display deleted; .length keeps its reveal + extra-pick payout (exact-spend rule gone), Telemetry keeps its fee ladder (forced peek gone), Moore's Law keeps interest (floor gone), Volkswagen re-shipped in Phase B.
- Docs: ADR-035 + supersession markers in 006/013/016/017/019/021/022/027/028/031/033/034 + README rows; wiki sections 2.x/3.x/4.x/5.x/glossary/appendix rewritten; CHANGELOG player entry.
- Verified with B and C together: 1518 tests green, oxlint + depcruise clean, build + tsc clean.

Tuning knobs left for Marciano (playtest): the demand table rows (gate 1 at 10 = 100% of strict base pace; drop to 8 if it hurts), the mirror's 0.5 demand factor, burn 16/48, strip quotas 2/3, pin price 512/from gate 4.
