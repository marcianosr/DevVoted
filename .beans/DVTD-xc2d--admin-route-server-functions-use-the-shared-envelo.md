---
# DVTD-xc2d
title: Admin route server functions use the shared envelope
status: todo
type: task
priority: low
created_at: 2026-09-25T19:45:54Z
updated_at: 2026-09-25T19:45:54Z
blocked_by:
    - DVTD-x242
---

**What:** The admin route's three server functions read the session through the shared wrapper and return the shared envelope.

**Why:** They are the last functions with their own session read and their own response shapes, and the route file may not import the application layer that owns the wrapper.

## Done when
- [ ] The three functions live in an application module the route mounts
- [ ] Each returns the shared envelope and refuses a non-admin through the shared admin wrapper

## Notes
Follow-up to the session-and-envelope slice of the deepening pass. `src/routes/_authed/admin.tsx` also holds eighty class attributes and three local components, the largest remaining ADR-010 violation; moving the server functions is the first cut.
