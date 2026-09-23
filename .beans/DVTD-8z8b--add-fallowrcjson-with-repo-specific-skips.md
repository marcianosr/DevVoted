---
# DVTD-8z8b
title: Add .fallowrc.json with repo-specific skips
status: completed
type: task
priority: normal
created_at: 2026-09-23T09:21:17Z
updated_at: 2026-09-23T09:26:58Z
---

Configure fallow (codebase intelligence CLI) for this repo: skip findings in scripts/ and src/presentation/ without dropping them from the module graph, plus build-output ignorePatterns. Decide config-file vs GitHub Actions placement.

## Summary of Changes

Added `.fallowrc.json`:
- `ignoreFindings`: `scripts/**`, `src/presentation/**` — hides findings without dropping the files from the module graph.
- `ignorePatterns`: `storybook-static/**`, `public/**`, `supabase/**` — build output / non-TS trees, safe to drop entirely.

Measured why `ignoreFindings` over `ignorePatterns` for `scripts/**`: with `ignorePatterns`, fallow reported `firebase-admin` (scripts/export-polls.js) and `keep-a-changelog` (scripts/release.ts) as unused dependencies. Both are live. `ignoreFindings` keeps them credited.

`src/presentation/**` currently matches no finding, so fallow prints an advisory note each run. Kept as forward insurance.

CI wiring applied: `fallow@3.28.0` pinned as a devDependency, `lint:dead` npm script, and a non-gating `Dead code check` step in pr-checks.yaml (quality-checks, after Run linter). Gating is deferred to DVTD-byvb, which tracks the five outstanding dependency findings.
