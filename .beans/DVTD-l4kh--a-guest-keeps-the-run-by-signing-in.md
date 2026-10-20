---
# DVTD-l4kh
title: A guest keeps the run by signing in
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

**What:** Linking GitHub or adding an email turns the guest into an account with the same run.

**Why:** Sign-in buys permanence; nothing should migrate.

## Done when
- [ ] Linking GitHub keeps the run and unlocks
- [ ] Adding email and password keeps the run and unlocks
- [ ] An identity that already has an account signs into that account with a plain message
- [ ] Sign-in is offered at the first gate close and the debrief

## Notes
- Slice 5 of DVTD-nr8f. linkIdentity / updateUser; ensureUserExists clears is_guest and fills email, display_name, github_username. Collision rule amends ADR-178.
