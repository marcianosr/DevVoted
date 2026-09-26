---
# DVTD-fw0z
title: Strip comments from all uncommitted/staged files
status: completed
type: task
priority: normal
created_at: 2026-09-11T06:37:06Z
updated_at: 2026-09-11T06:43:45Z
---

Per the zero-comment rule (global CLAUDE.md + no-epistle-comments memory), remove comments from every file in the working tree that is staged or modified. Use the TypeScript API for comment ranges, not regex. Preserve functional directives (@ts-*, eslint/oxlint-disable, @vitest-environment, /// <reference>, prettier-ignore, coverage-ignore).

- [x] Inventory comments across the 140 changed ts/tsx files
- [x] Write TS-API-based strip script
- [x] Dry run and review preserved-directive list
- [x] Apply strip
- [x] Decide on app.css comments
- [x] Verify: lint, typecheck, tests

## Summary of Changes

Removed 549 comments from 100 of the 140 changed .ts/.tsx files. Zero functional directives existed in the set, so nothing was preserved.

Method: TypeScript compiler API for comment ranges (getLeadingCommentRanges/getTrailingCommentRanges over every token, plus empty JsxExpression nodes for JSX comments), with string/template/JsxText spans excluded so no literal could be mistaken for a comment. Own-line comments took their whole line; trailing comments took their leading whitespace. Runs of 3+ newlines collapsed to one blank line.

Proof of safety: TypeScript token streams compared before/after across all 140 files, identical everywhere (the verifier must skip JSDoc nodes and empty JsxExpressions, which appear in getChildren but are pure comment).

PollMarkdown.ui.tsx needed a prettier pass: its comments sat inside a chained .replace() and were forcing a line break that prettier reflowed once they were gone.

src/styles/app.css deliberately untouched (Marcianos call): its 78 comments document the Kanto design-token system, and the bg-hatched one is cited elsewhere as canonical. .md files out of scope.

Verification: lint clean (1 pre-existing unused-param warning in Screen.stories.tsx), depcruise 951 modules no violations, build passed, 234 test files / 4182 tests passed.
