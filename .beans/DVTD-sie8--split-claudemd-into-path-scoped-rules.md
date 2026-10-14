---
# DVTD-sie8
title: Split CLAUDE.md into path-scoped rules
status: completed
type: task
priority: normal
created_at: 2026-10-14T14:47:33Z
updated_at: 2026-10-14T14:48:51Z
---

**What:** The project agent instructions are split into a short always-on core and topic files that load only when matching files are touched.

**Why:** The single instruction file loads in full every session, so CSS work pays for backend and auth rules it never needs.

## Done when
- [x] The always-on instruction file holds only what every session needs
- [x] Each topic (CSS, TypeScript, paradigms, architecture, React, testing, backend, database) lives in its own file that loads by path
- [x] Every line of the old file lands in exactly one place
- [x] Stale statements found while moving are fixed

## Notes
Rule files live in .claude/rules/ with paths: frontmatter. The server-function auth guard stays one line in CLAUDE.md so it never depends on a glob match.

## Summary of Changes

CLAUDE.md went from 246 to 74 lines: overview, commands, stack, alias, a one-line auth guard, a rule index and the workflow notes. Eight path-scoped files in .claude/rules/ (architecture, react, css, typescript, paradigms, backend, database, testing) hold the rest verbatim. Fixed while moving: src/components/ holds four wrappers, not three. The duplicate schema-documentation line was dropped.
