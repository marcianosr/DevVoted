---
# DVTD-wz1b
title: 'Architecture review: deepening opportunities in src/modules'
status: scrapped
type: task
priority: normal
created_at: 2026-07-25T08:34:00Z
updated_at: 2026-07-27T14:17:00Z
parent: DVTD-82c4
---

Ran /improve-codebase-architecture over src/modules/. Explore agent surfaced friction; candidates presented to Marciano for grilling. Top candidates: (1) retire legacy domains/ run engine (stalled ADR-007 migration, two live engines), (2) consolidate Config Effects Engine (4 fold-sites), (3) unify answer-outcome rule (triplicated), (4) extract+test RunGame orchestration state machine, (5) single source for RunAction contract (zod/TS twins), (6) cut modules→domains legacy tendrils, (7) delete session-run leftover + dead exports.
