---
# DVTD-ojkl
title: A guest has an account row
status: in-progress
type: task
priority: high
created_at: 2026-10-20T10:18:34Z
updated_at: 2026-10-27T16:14:39Z
parent: DVTD-nr8f
---

**What:** A logged-in-anonymous session gets a users row marked as a guest.

**Why:** Every server function keys on a users row; a guest needs one without an email.

## Done when
- [x] An anonymous session is treated as logged in
- [x] A guest gets a row with no email and the guest flag set
- [ ] Anonymous sign-in and manual linking are on locally and in prod

## Notes
- Slice 1 of DVTD-nr8f. Make users.email nullable, add users.is_guest, fetchUser accepts is_anonymous, insertUser names the row Guest. Migration per ADR-012.

- 2026-10-20: local config.toml on. Prod dashboard (Auth > Sign In / Providers: anonymous sign-ins, manual linking) still to switch by hand before slice 3 ships.
- Admin user and dormant lists drop rows without an email, since a reminder needs one.

- 2026-10-27: Marciano asked to switch prod on. `supabase config push` was tried from the agent and refused by the permission classifier; the push (or the dashboard toggles) is his to run.
