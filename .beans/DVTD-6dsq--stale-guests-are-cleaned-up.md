---
# DVTD-6dsq
title: Stale guests are cleaned up
status: todo
type: task
priority: high
created_at: 2026-10-20T10:18:35Z
updated_at: 2026-10-20T10:18:38Z
parent: DVTD-nr8f
blocked_by:
    - DVTD-ojkl
    - DVTD-y7oz
---

**What:** Guests unseen for a while are deleted with everything they own.

**Why:** Anonymous users pile up (ADR-178 consequences).

## Done when
- [ ] A guest unseen past the cutoff is removed from both the app and auth
- [ ] An account is never removed by the cleanup

## Notes
- Slice 6 of DVTD-nr8f. pg_cron job in a migration; delete public.users (cascades) and auth.users, no FK between them. Cutoff 30 days as a named value.
