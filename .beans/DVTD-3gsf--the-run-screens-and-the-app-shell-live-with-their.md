---
# DVTD-3gsf
title: The run screens and the app shell live with their concepts
status: completed
type: task
priority: normal
created_at: 2026-10-16T08:07:20Z
updated_at: 2026-10-16T08:40:11Z
parent: DVTD-5303
blocked_by:
    - DVTD-r9t1
---

**What:** The poll, prep, review and run-over screens and their parts move to the run, and the nav and footer get a home of their own.

**Why:** These compose everything moved before, so they go last.

## Done when

- [x] No screen is left in the kit
- [x] The nav and footer live in their own app-shell home
- [x] Lint, typecheck and tests are green

## Notes

Targets: run/run (incl. Audit, AuditsPanel), app/shell (new aggregate: AppNav, AppFooter, useNavRun). Add app/shell to ADR-002's context list and CONTEXT.md.

## Summary of Changes

Run screens and their parts moved to run/run, plus ScreenFooter and Prose (Prose renders Figures, which badges coverage bands and categories). AppNav, AppFooter and useNavRun live in the new app/shell aggregate; ADR-002's context table gained app/shell and lost its stale rows (pipeline is build; incident, poll, guide, ops added).
