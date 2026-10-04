---
# DVTD-v8y3
title: Changelog-driven release automation
status: completed
type: feature
priority: normal
created_at: 2026-07-06T20:22:57Z
updated_at: 2026-07-06T20:31:50Z
---

Port pyramid-scheme's changelog release system to DevVoted (npm, separate deploy).

## Todo
- [x] Add keep-a-changelog dev dep + release npm script
- [x] Add scripts/release.ts engine
- [x] Add check-version job (PR version-preview comment) to pr-checks.yaml
- [x] Add .github/workflows/release.yaml (bump + commit, then dispatch main.yaml)
- [x] Normalize CHANGELOG.md release date format to ISO (YYYY-MM-DD)

## Summary of Changes

- Installed keep-a-changelog dev dep; added scripts/release.ts engine + release npm script.
- Normalized CHANGELOG.md to strict Keep a Changelog format (ISO dates, [Unreleased], pre-1.0 weekly logs -> 0.3.0..0.9.0).
- pr-checks.yaml: added check-version job posting a PR comment with the predicted next version + unreleased diff.
- release.yaml: workflow_dispatch that bumps version, finalizes changelog, commits to main, then dispatches main.yaml (GITHUB_TOKEN pushes do not auto-trigger workflows).
- Verified engine: parse OK, empty-unreleased skip, minor/patch detection, full round-trip rewrite.
