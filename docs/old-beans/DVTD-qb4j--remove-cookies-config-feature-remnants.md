---
# DVTD-qb4j
title: Remove cookies-config feature remnants
status: completed
type: task
priority: normal
created_at: 2026-06-01T13:00:13Z
updated_at: 2026-06-01T13:02:25Z
---

User turned off the cookies config. Need to remove the now-stale tests + any UI/code referencing cookies-config, cookies-accept-all-config, cookies-reject-all-config.

## Summary of Changes

### `src/domains/economy/data/configs.ts`
- Removed the commented-out cookies-config shell + variants blob (lines 583-630). Dead code.

### `src/domains/economy/data/configs.spec.ts`
- Removed the entire `describe("cookies config (shell + variants)")` block (5 tests, all failing because the cookies config was disabled).
- Removed now-unused `STORAGE_UNITS` import.

### `src/domains/economy/services/configManager.service.spec.ts`
- Renamed cookie-themed fixtures (`cookies-config`, `cookies-accept-all-config`, `cookies-reject-all-config`) to generic placeholders (`shell-config`, `shell-variant-a`, `shell-variant-b`). These tests still validate the generic shell/variant pattern in `canAddConfigToRun` and `isConfigInstalled`, so they were kept — only the fixture names changed to reflect that the cookies feature no longer exists.

### Result
- Before: 5 failing tests
- After: 354 passing, 0 failing (6 skipped, 1 todo)
