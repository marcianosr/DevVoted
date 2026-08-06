---
# DVTD-0dkp
title: Idle linter row reads skipped, not the usable arrow mark
status: completed
type: bug
priority: normal
created_at: 2026-08-06T08:32:27Z
updated_at: 2026-08-06T08:40:44Z
---

Marciano (2026-08-06, screenshot): the ESLint pipeline row showed the arrow affordance mark while usable-but-idle. It should sit in the plain skipped state until the linter is actually used — the use-8KB button already carries the affordance — and then color by its check (running, then passed/failed). Removes the usable prop (PipelineReportRow, RoleList) and the dead use StatusDot variant.

## Summary of Changes

- PipelineReportRow no longer promotes a skipped-but-usable linter's dot to the ▸ mark (`variant={mark ?? badge}`); the `usable` prop deleted (RoleList pass-through too) and the `use` StatusDot variant removed. Applies to both linters (shared component); category gating untouched — the use-button still only attaches to the linter matching the current poll (ESLint on JS/TS, Stylelint on CSS), per Marciano's follow-up.
- Regression spec in AnsweringScreen: idle ready linter shows an enabled use-button, dot reads 'skipped', no 'usable' img.
- Wiki §8 + CHANGELOG pipeline-rows bullet updated.

Verified: vitest green, tsc clean, lint clean (final counts on the perk-removal bean, same sweep).
