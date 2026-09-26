---
# DVTD-j6t1
title: Rewrite standouts to the four-award roster
status: scrapped
type: task
priority: high
created_at: 2026-09-11T11:12:07Z
updated_at: 2026-09-23T13:23:53Z
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

## Reasons for Scrapping

DVTD-zptd replaced the standouts section on the community board with the twelve-seat **category leaders** table (ADR-103), and retired standouts outright: `standouts.model.ts`, `fetchActiveRunStats` and both rosters are deleted, and ADR-065 and ADR-067 are retired to README rows.

ADR-067's argument against the six still stands and is quoted in ADR-103 Decision 5 — they need the climb's vocabulary on the screen a player meets before their first poll. Its own four-standing roster is dropped for a plainer reason: four standings that each rank a different thing are four things to learn, where a seat per category is one thing repeated twelve times.

`RunState.configsLost` was kept, as this bean asked.
