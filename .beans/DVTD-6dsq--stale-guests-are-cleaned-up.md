---
# DVTD-6dsq
title: Stale guests are cleaned up
status: completed
type: task
priority: high
created_at: 2026-10-20T10:18:35Z
updated_at: 2026-11-01T11:55:41Z
parent: DVTD-nr8f
blocked_by:
    - DVTD-ojkl
    - DVTD-y7oz
---

**What:** Guests unseen for a while are deleted with everything they own.

**Why:** Anonymous users pile up (ADR-178 consequences).

## Done when
- [x] A guest unseen past the cutoff is removed from both the app and auth
- [x] An account is never removed by the cleanup

## Notes
- Slice 6 of DVTD-nr8f. pg_cron job in a migration; delete public.users (cascades) and auth.users, no FK between them. Cutoff 30 days as a named value.

## Summary of Changes

2026-11-01: migration 20261101120000_stale_guest_cleanup.sql enables pg_cron and adds public.delete_stale_guests(unseen_for default 30 days), SECURITY DEFINER with an empty search_path, execute revoked from PUBLIC, anon and authenticated so the API cannot call it. A row is stale when public.users.is_guest and auth.users.is_anonymous are both true and coalesce(last_seen_at, created_at) is past the cutoff; both markers must agree so a guest mid-link is never removed. It deletes public.users (runs and the rest cascade) and then auth.users. Cron job delete-stale-guests runs daily at 03:00 UTC; the migration unschedules an existing job first so a rerun is safe.

Verified locally in a rolled-back transaction: of an old guest, a fresh guest, an old member and an old guest whose auth session is no longer anonymous, only the old guest went, from both tables; anon got permission denied.
