---
# DVTD-g1dp
title: Auto-create GitHub Release in release workflow
status: completed
type: feature
priority: normal
created_at: 2026-07-07T07:32:44Z
updated_at: 2026-07-07T07:33:42Z
---

release.yaml bumps version + changelog but does not create the git tag / GitHub Release the project convention expects (v1.0.0-v1.2.0 all have them). Add a step that tags and publishes a GitHub Release with notes extracted from the just-released CHANGELOG section.

## Todo
- [x] Add 'Create GitHub release' step to release.yaml (extract notes via awk, publish with gh, --notes-file to avoid shell-injection of changelog backticks)

## Summary of Changes
Added a 'Publish GitHub release' step to release.yaml: extracts the just-released CHANGELOG section via awk into release-notes.md and runs 'gh release create vX.Y.Z --target main --latest --notes-file'. Uses --notes-file (not inline --notes) so changelog backticks can't be executed as shell command substitution.
