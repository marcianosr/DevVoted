---
# DVTD-4mxj
title: Run the dead-code check after the old app is deleted
status: todo
type: task
priority: high
created_at: 2026-08-13T11:06:21Z
updated_at: 2026-09-24T12:49:35Z
parent: DVTD-82c4
---

**What:** Run the dead-code sweep once the old app is gone, and clear what it finds.

**Why:** Deleting the old app strands code that nothing calls any more.

## Done when
- [ ] The dead-code check runs clean, or every remaining finding is ignored on purpose with a reason
- [ ] Nothing in the codebase still refers to the old app

## Notes

Clean up and verify run state after removing old app. Ensure no orphaned references or stale data.
