---
# DVTD-l4kh
title: A guest keeps the run by signing in
status: in-progress
type: task
priority: high
created_at: 2026-10-20T10:18:35Z
updated_at: 2026-10-28T11:32:01Z
parent: DVTD-nr8f
blocked_by:
    - DVTD-ojkl
    - DVTD-y7oz
---

**What:** Linking GitHub or adding an email turns the guest into an account with the same run.

**Why:** Sign-in buys permanence; nothing should migrate.

## Done when
- [x] Linking GitHub keeps the run and unlocks
- [x] Adding email and password keeps the run and unlocks
- [x] An identity that already has an account signs into that account with a plain message
- [ ] Sign-in is offered at the first gate close and the debrief

## Notes
- Slice 5 of DVTD-nr8f. linkIdentity / updateUser; ensureUserExists clears is_guest and fills email, display_name, github_username. Collision rule amends ADR-178.

- 2026-10-28: a guest viewer on the login page calls linkIdentity for GitHub instead of signInWithOAuth; signupFn calls updateUser (email + password) when the session is anonymous. ensureUserExists promotes the stored guest row in place (promoteGuest: is_guest false, email, display name, photo) once the session is no longer anonymous; the Kanto name is dropped, as Marciano decided. The callback route reads error_code identity_already_exists and sends the guest to /login?identity=taken, where the screen explains it and the GitHub press signs in plainly. Not run end to end in a browser: the OAuth link round trip and the email-change confirmation (prod has confirmations on, so the email path promotes the row only after the player confirms) still need a local pass. The fourth box, sign-in offered at the first gate close and the debrief, is open.
