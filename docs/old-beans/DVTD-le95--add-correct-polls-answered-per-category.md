---
# DVTD-le95
title: Add correct_polls_answered per category
status: completed
type: task
priority: normal
created_at: 2026-05-14T09:56:02Z
updated_at: 2026-05-14T09:58:13Z
---

Track correctly answered polls per category in run_category_coverage. Add correct_polls_answered column to schema, update model, update awardCoverageToRun query, and thread the value through progress.service.

## Summary of Changes\n\n- Added  (NOT NULL, default 0) and  (nullable) columns to  in schema\n- Updated  DTO type, , , and  factory\n- Updated  to accept and persist the new count\n- Threaded  check through  to derive the increment\n- Updated  to snapshot  → \n- Added COALESCE for  in the last-run stats query\n- Fixed two call sites in \n- Generated migration 
