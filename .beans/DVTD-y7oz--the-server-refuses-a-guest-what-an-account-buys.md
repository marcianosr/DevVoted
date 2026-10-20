---
# DVTD-y7oz
title: The server refuses a guest what an account buys
status: todo
type: task
priority: high
created_at: 2026-10-20T10:18:35Z
updated_at: 2026-10-20T10:18:38Z
parent: DVTD-nr8f
blocked_by:
    - DVTD-ojkl
---

**What:** Presses ADR-178 withholds are refused on the server for a guest.

**Why:** A guest must not reveal more than today's five or keep anything permanent.

## Done when
- [ ] A guest cannot start a second run, abandon or reroll
- [ ] A guest cannot author polls, change titles or looks, archive, or open the Dex
- [ ] A guest still plays the run normally

## Notes
- Slice 2 of DVTD-nr8f. Session gains isGuest from the is_anonymous claim; a withMemberUser wrapper beside withAdminUser; tested once in authorization.spec.ts.
