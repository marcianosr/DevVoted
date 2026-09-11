---
# DVTD-j6t1
title: Rewrite standouts to the four-award roster
status: todo
type: task
priority: high
created_at: 2026-09-11T11:12:07Z
updated_at: 2026-09-11T11:12:07Z
blocked_by:
    - DVTD-agt2
---

ADR-067 reverses ADR-065: the roster becomes most active / most knowledgeable (per category) / fastest / biggest bank. The ADR is accepted; the code still computes the six. This bean closes that gap.

- [ ] Rewrite `standouts.model.ts`: four builders, new thresholds, registry order = grid order
- [ ] `StandoutInput` regains answer timing and category inputs
- [ ] `fetchActiveRunStats` drops pollsIntoGate/configsLost/startedAtGate/footprints for awards; gains storage held and per-category accuracy
- [ ] Retarget the live terminal CommunityScreen (six boxes to four)
- [ ] Update wiki section 7.3 (it documents the six with their copy strings)
- [ ] Drop the 'model not yet rewritten' caveat from ADR-067 and the ADR README row

Keep `RunState.configsLost` — a run statistic worth counting whether or not an award reads it.
