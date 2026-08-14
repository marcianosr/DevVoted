---
# DVTD-r4gx
title: Gate-type specific rewards
status: scrapped
type: feature
priority: high
created_at: 2026-05-08T00:00:00Z
updated_at: 2026-05-29T07:57:56Z
parent: DVTD-lwvx
---

Replace the flat storage-only reward with gate-type-specific rewards. Each gate type earns a thematically tied reward so gate choice becomes a build decision.

## Reward mapping

| Gate type | Reward |
|---|---|
| `correct-answers` | Storage (current — kept as baseline) |
| `coverage-gain` | Extended poll window |
| `category-mastery` | Coverage boost for the mastered category |
| `cold-start` | Raise base coverage gain for the rest of the run |
| `short-window` | TBD |

Difficulty tier still controls reward magnitude (low → critical = small → large).

## Open questions

- What does `short-window` reward? Needs a reward that isn't config-like.
- Does extended window persist for one gate cycle or permanently?
- How much does base coverage gain increase for `cold-start`?
