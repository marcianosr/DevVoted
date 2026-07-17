---
# DVTD-1q2y
title: 'run finish-line: leaderboard rows + same-seed daily ranking'
status: todo
type: feature
created_at: 2026-07-17T12:41:23Z
updated_at: 2026-07-17T12:41:23Z
---

When a session run hits won/dead, write leaderboard rows from the run_states blob (per-category from coverageByCategory, total_coverage = coverage, completed_at = now). Daily same-seed ranking = filter runs.seed_date. Add gates_cleared column to leaderboard only if deepest-gate becomes the ranked metric. archived_storage credit already ships in slice 1. See DVTD-ay5e summary.
