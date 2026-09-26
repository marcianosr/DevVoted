---
# DVTD-x242
title: One way to read the session, one response envelope
status: todo
type: task
priority: high
created_at: 2026-09-25T19:45:47Z
updated_at: 2026-09-25T19:45:47Z
parent: DVTD-y3vn
---

**What:** Every server function reads who is signed in through one wrapper and returns one response shape, with the admin flag inside the data.

**Why:** Five ways to read the session exist and eight functions throw at a signed-out caller instead of answering with a failed response, and nothing tests any of them.

## Done when
- [ ] A signed-out call to any authenticated server function returns a failed response, never a thrown error
- [ ] The admin check is one wrapper and the admin flag travels inside the data
- [ ] The wrapper's policy has a spec: session handed over, signed out refused, failing and throwing operations caught, non-admin refused
- [ ] The dead authorization helper and the dead display-name lookup are gone
- [ ] The project guide's authorization section names the wrapper and its exceptions

## Notes
Plan section "Slice 3". Decided: keep `withAuthenticatedUser` (callback now receives `Session = { userId, isAdmin }`), add `withAdminUser`; a plain wrapper, not a function middleware (a middleware short-circuit needs a cast). Private `readSession()` replaces the exported `getAuthenticatedUserId`. Delete `ensureAuthorizedUser`, `requireUser`, `ensureAdminAccess`, `profile.serverfn.ts`, `fetchUsersByDisplayNames`. Inline `poll.service.ts`; drop the double zod parse in `authoring.service.ts`. Exceptions kept: `loginFn`/`signupFn`/`fetchUser`, `visit.serverfn` (ADR-104), the admin route's own server functions (follow-up bean). Consumers unwrapping `data`: PollList, PollDetail, PollEdit — same commit. CLAUDE.md Authorization section rewritten.
