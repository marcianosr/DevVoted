---
# DVTD-dl9h
title: 'PR checks: fix wrong bump, Vercel build command, and workflow hygiene'
status: completed
type: task
priority: normal
created_at: 2026-09-23T10:48:20Z
updated_at: 2026-09-23T11:02:06Z
---

Follow-up review of .github/workflows/pr-checks.yaml. Plan: ~/.claude-work/plans/any-other-recommendations-name-tranquil-badger.md

- [x] CHANGELOG.md: categorise Unreleased bullets under ### Added/Changed/Removed/Fixed (bare bullets parse as description, so the bump reads patch)
- [x] scripts/release.ts: fail on uncategorised entries; add --json output
- [x] pr-checks.yaml: jq parsing, PR-only check-version, typecheck + vite build steps, permissions, concurrency, timeout, plain npm test
- [x] release.yaml: read --json instead of tee + grep
- [x] vercel.json: buildCommand drops the removed db:migrate script (ADR-012)
- [x] docs/production-release.md: fix stale manual-migration fallback
- [x] package.json typecheck script; build and .husky/pre-commit use it
- [x] Verify: dry-run --json says minor; lint, format:check, typecheck, test, vite build pass (whole-repo runs blocked only by a staged syntax error in RunCommunity.component.tsx, not by this work)

## Summary of Changes

- CHANGELOG.md: the 233 bare Unreleased bullets now sit under ### Added (60) / Changed (158) / Removed (4) / Fixed (11); the dry-run reads minor → 1.4.0 instead of patch → 1.3.1.
- scripts/release-decision.ts (+ spec, 9 tests): pure bump decision; rejects entries outside a category heading. scripts/release.ts: exits 1 on those, `--json` for CI, writes package.json with tabs.
- pr-checks.yaml: check-version runs on PRs only, reads the JSON with jq, least-privilege permissions, concurrency cancel, 5-minute timeout; quality-checks runs `npm run typecheck`, `npm test`, `npx vite build` (tsc once).
- release.yaml: reads the same JSON.
- vercel.json: buildCommand no longer calls the removed db:migrate script (ADR-012).
- docs/production-release.md: manual-migration fallback points at supabase/migrations.
- package.json `typecheck` script; build and .husky/pre-commit use it.

Not done here: docs/changelog-maintenance.md still shows `[x.y.z] — YYYY-MM-DD` with an em dash and bracketed headings; the tool writes ` - ` and no brackets. Flagged to Marciano.
