---
# DVTD-5u32
title: Coverage outruns the slot ladder — every slot affordable by gate 6
status: scrapped
type: task
priority: normal
created_at: 2026-08-06T15:47:37Z
updated_at: 2026-09-06T10:10:16Z
---

Measured 2026-08-06 by driving the reducer through a flawless 3-slot run (gates 0-12).

Coverage scales with depth (`gateBaseMultiplier = gatesCleared + 1`), so it compounds far faster than the slot ladder climbs:

| after gate | 1 | 3 | 5 | 6 | 9 | 12 |
|---|---|---|---|---|---|---|
| total coverage | 25% | 115% | 312% | 462% | 1183% | 2412% |
| slots affordable | 5 | 9 | 12 | **14 of 14** | 14 | 14 |

The top rung is 415%, cleared **after gate 6** — halfway up a 13-gate climb. Consequences:

- Slots stop being a decision in the back half; the binding constraint becomes having configs to fill them (draft luck + storage), not coverage.
- The 325%/415% rungs (Claude's extrapolation, never playtested) are dead weight — reached before they can bite.
- "Breadth earns width" (ADR-008) stops meaning anything once width is free.

Not necessarily wrong — abundance late is a fine shape — but it should be a decision, not an accident. Levers:

- [ ] Decide whether the ladder should stay meaningful to gate 12, or deliberately resolve by the midpoint
- [ ] If it should stay meaningful: steepen the late rungs against the *measured* curve above, or damp the depth multiplier on coverage
- [ ] If it should resolve early: delete the 325/415 rungs and lower MAX_SLOTS to what the tuned rungs cover, so the cap is honest
- [ ] Either way: coverage is also the run score (see the coverage-is-score memory), so any change has to keep the score readable
