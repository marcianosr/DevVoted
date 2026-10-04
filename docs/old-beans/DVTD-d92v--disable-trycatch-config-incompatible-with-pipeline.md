---
# DVTD-d92v
title: Disable Try/Catch config (incompatible with pipelines)
status: completed
type: task
priority: normal
created_at: 2026-07-10T08:55:04Z
updated_at: 2026-07-10T08:55:57Z
---

The Try/Catch config's protection.tryCatch only fires on a pipeline gate failure (turn.service.ts resolveRunState). It doesn't fit the current pipeline model. Temporarily disable it (comment out config object, matching existing .py-config/deflate-config convention) until the planned config-system improvement lands.

- [x] Comment out try-catch-config object in configs.ts
- [x] Park the live checkCoverageWithThreshold effect test (would fail once config no longer resolves)
- [x] Run typecheck + tests

## Summary of Changes

Commented out the try-catch-config object in configs.ts (matching the existing .py-config/deflate-config disable convention) so it no longer enters the shop pool. The checkCoverageWithThreshold effect fn and protection.tryCatch plumbing in turn.service.ts are left intact as dead-but-ready code. Parked the one live effect test as it.todo. Typecheck clean; configs.spec.ts (48 pass / 2 todo) and turn.service.spec.ts (15 pass) green.
