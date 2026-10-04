---
# DVTD-wf2k
title: 'src/lib: migrate or keep — can''t remove'
status: completed
type: task
priority: high
created_at: 2026-08-13T11:01:23Z
updated_at: 2026-10-01T15:39:17Z
parent: DVTD-irbz
---

Audit src/lib usage. Either migrate to new module structure (ADR-002) or document why it must stay. Currently can't be removed.

## Summary of Changes

Closed in the 2026-10-01 stale-bean sweep: the code already does this. src/lib no longer exists; its contents live in src/shared/lib and nothing imports ~/lib/.
