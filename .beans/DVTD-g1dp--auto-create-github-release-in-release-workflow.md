---
# DVTD-g1dp
title: Auto-create GitHub Release in release workflow
status: in-progress
type: feature
priority: normal
created_at: 2026-07-07T07:32:44Z
updated_at: 2026-07-07T07:32:44Z
---

release.yaml bumps version + changelog but does not create the git tag / GitHub Release the project convention expects (v1.0.0-v1.2.0 all have them). Add a step that tags and publishes a GitHub Release with notes extracted from the just-released CHANGELOG section.

## Todo
- [ ] Add 'Create GitHub release' step to release.yaml (extract notes via awk, publish with gh, --notes-file to avoid shell-injection of changelog backticks)
