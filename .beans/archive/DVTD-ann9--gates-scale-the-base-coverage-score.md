---
# DVTD-ann9
title: Gates scale the base coverage score
status: completed
type: feature
priority: normal
created_at: 2026-07-21T20:29:44Z
updated_at: 2026-07-22T08:52:54Z
---

Deeper gates are worth more: the base coverage a correct answer earns scales with the gate number (gate 1 x1, gate 2 x2, ...). Gains only — a wrong answer's coverage loss stays flat.

## Summary of Changes
- rules.model.ts: added gateBaseMultiplier(gatesCleared) = gatesCleared + 1
- climb/run.model.ts: answer() scales the correctness share by the gate multiplier for the earn + breakdown; loss path still reads the unscaled share
- No view/UI change needed — the scaled base flows through coverageBreakdownForAnswer into latestAnswerScore.baseCoverage and the reveal chips automatically
- Tests: run.model.spec 'gate base multiplier' (base = gate number; loss stays flat)

- [x] gateBaseMultiplier rule
- [x] scale share for gains in answer()
- [x] keep loss unscaled
- [x] tests

## Update — loss also scales (2026-07-22)
Wrong-answer coverage loss now scales by the same gate multiplier (previously flat). A miss at gate 5 costs 5× the base loss, so risk stays proportional to reward as you climb. Coverage still floored at 0. Test updated: 'scales a wrong answer's loss by the gate too'.

## Documented in ADR-013 (2026-07-22)
Both the gate-scaled base gain AND the gate-scaled loss are recorded in docs/adr/013-gate-scaled-coverage.md, which amends ADR-006 Decision 11 (previously 'loss deliberately not gate-scaled'). Death-spiral concern resolved by the 0-floor. Numbers stay in rules.model.ts per the ADR numbers-live-in-code convention.
