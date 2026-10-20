---
# DVTD-ojkl
title: A guest has an account row
status: todo
type: task
priority: high
created_at: 2026-10-20T10:18:34Z
updated_at: 2026-10-20T10:18:34Z
parent: DVTD-nr8f
---

**What:** A logged-in-anonymous session gets a users row marked as a guest.

**Why:** Every server function keys on a users row; a guest needs one without an email.

## Done when
- [ ] An anonymous session is treated as logged in
- [ ] A guest gets a row with no email and the guest flag set
- [ ] Anonymous sign-in and manual linking are on locally and in prod

## Notes
- Slice 1 of DVTD-nr8f. Make users.email nullable, add users.is_guest, fetchUser accepts is_anonymous, insertUser names the row Guest. Migration per ADR-012.
