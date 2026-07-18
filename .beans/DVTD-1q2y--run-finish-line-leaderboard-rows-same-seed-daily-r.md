---
# DVTD-1q2y
title: 'run finish-line: leaderboard rows + same-seed daily ranking'
status: todo
type: feature
priority: normal
created_at: 2026-07-17T12:41:23Z
updated_at: 2026-07-18T07:24:08Z
blocked_by:
    - DVTD-fyxm
---

When a session run hits won/dead, write leaderboard rows from the run_states blob (per-category from coverageByCategory, total_coverage = coverage, completed_at = now). Daily same-seed ranking = filter runs.seed_date. Add gates_cleared column to leaderboard only if deepest-gate becomes the ranked metric. archived_storage credit already ships in slice 1. See DVTD-ay5e summary.

**Reshaped by ADR-011 (2026-07-18)**: runs span days, so 'same-seed daily ranking' no longer describes a whole run. Two views instead: (1) progress today — same-day segment, comparable across everyone playing that day; (2) run completion — won/dead, gates cleared, duration in days. Blocked by DVTD-fyxm (needs segment_date on answers to compute 'today').
