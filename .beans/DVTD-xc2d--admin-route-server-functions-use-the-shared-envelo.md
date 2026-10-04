---
# DVTD-xc2d
title: Admin route server functions use the shared envelope
status: completed
type: task
priority: low
created_at: 2026-09-25T19:45:54Z
updated_at: 2026-09-30T16:50:49Z
blocked_by:
    - DVTD-x242
---

**What:** The admin route's three server functions read the session through the shared wrapper and return the shared envelope.

**Why:** They are the last functions with their own session read and their own response shapes, and the route file may not import the application layer that owns the wrapper.

## Done when
- [x] The three functions live in an application module the route mounts
- [x] Each returns the shared envelope and refuses a non-admin through the shared admin wrapper

## Notes
Follow-up to the session-and-envelope slice of the deepening pass. `src/routes/_authed/admin.tsx` also holds eighty class attributes and three local components, the largest remaining ADR-010 violation; moving the server functions is the first cut.

## Summary of Changes (2026-09-30)

New aggregate `ops/admin`: `admin.repository.ts` (the five reads, typed rows, `countActiveRuns` counts instead of selecting rows), `admin.service.ts` (`getAdminDashboardService`, `sendReminderEmailService` owning the reminder copy), `admin.serverfn.ts` (`getAdminDashboard`, `sendReminderEmail`, both behind `withAdminUser`), `adminPanel.viewmodel.ts` (+ spec: run grouping, stamps, anonymous, joined dates), `AdminPanel.ui.tsx` (the markup, moved verbatim under a `COPY` object) and `AdminPanel.component.tsx` (`useApiQuery` + one mutation). `src/routes/_authed/admin.tsx` is six lines and mounts the component; its `beforeLoad` / `loader` / `errorComponent` are gone because the server functions refuse a non-admin and the component shows the envelope's error. The ADR-010 violation the bean mentioned is gone with it. Behaviour change: the five-second auto-hide of the failure banner was dropped; the banner clears on the next successful send.
