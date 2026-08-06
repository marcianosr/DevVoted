---
# DVTD-0dkp
title: Idle linter row reads skipped, not the usable arrow mark
status: in-progress
type: bug
created_at: 2026-08-06T08:32:27Z
updated_at: 2026-08-06T08:32:27Z
---

Marciano (2026-08-06, screenshot): the ESLint pipeline row showed the arrow affordance mark while usable-but-idle. It should sit in the plain skipped state until the linter is actually used — the use-8KB button already carries the affordance — and then color by its check (running, then passed/failed). Removes the usable prop (PipelineReportRow, RoleList) and the dead use StatusDot variant.
