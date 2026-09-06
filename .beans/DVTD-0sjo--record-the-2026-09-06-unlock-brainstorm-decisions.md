---
# DVTD-0sjo
title: Record the 2026-09-06 unlock brainstorm decisions (ADR-063 + amendments)
status: completed
type: task
priority: normal
created_at: 2026-09-06T09:18:52Z
updated_at: 2026-09-06T09:25:52Z
---

Six decisions from the unlock-system brainstorm: checkmark-only big grants, five new objective rows (+4 metrics), user_config_unlocks table with provenance, two-beat unlock moment, seat-first deal ordering, Dex captions confirmed. Plan: ~/.claude-work/plans/can-we-brainstorm-about-staged-eich.md

## Todos

- [x] ADR-064 written and indexed (renumbered: a parallel session landed 063, the Planning Poker ADR, mid-task)
- [x] ADR-051 amended (6 rows, 5 metrics, ledger pointer — planning-poker was a sixth row-less config)
- [x] ADR-062 amended (unplayed column -> table, five-configs bullet resolved + planningPoker noted)
- [x] Beans DVTD-clgs / DVTD-p9ah / DVTD-of79 updated
- [x] Wiki consistency sweep (§6.2: 21 -> 27, two-beat + seat-first added)
- [x] Memory updated (config-unlock-design + decisions log)

## Summary of Changes

- New docs/adr/064-a-grant-is-recorded-with-its-provenance.md: `user_config_unlocks` table (grant + via_metric provenance + unplayed queue in one), two-beat unlock moment, seat-dealt-first rule, checkmark-is-the-reward for oversized grants. Indexed in the ADR README.
- ADR-051: status amendment note; decision 3 table gains six rows (yarn.lock 550, Planning Poker 575, A/B Test 600, Garbage Collection 625, Cache 650, git rebase -i 675); decision 4 gains five cumulative metrics; consequences ledger bullet points at ADR-064. GC exception documented (peel-triggered mechanic rewards failure).
- ADR-062: new-grant-guarantee bullet reads the table + seat-first order; row-less-configs bullet marked resolved (list had missed planningPoker).
- ADR-050: status + consequence bullet carry supersession markers for the dead column.
- wiki.md §6.2: counts and the grant-moment/seat rules updated.
- Work beans DVTD-clgs / DVTD-p9ah / DVTD-of79 updated to build against the table, the new metrics (27 earned rows) and the two-beat decision.

Docs-only change; nothing player-visible, no CHANGELOG entry.
