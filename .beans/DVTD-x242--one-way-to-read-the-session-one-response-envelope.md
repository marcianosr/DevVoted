---
# DVTD-x242
title: One way to read the session, one response envelope
status: completed
type: task
priority: high
created_at: 2026-09-25T19:45:47Z
updated_at: 2026-09-30T16:50:49Z
parent: DVTD-y3vn
---

**What:** Every server function reads who is signed in through one wrapper and returns one response shape, with the admin flag inside the data.

**Why:** Five ways to read the session exist and eight functions throw at a signed-out caller instead of answering with a failed response, and nothing tests any of them.

## Done when
- [x] A signed-out call to any authenticated server function returns a failed response, never a thrown error
- [x] The admin check is one wrapper and the admin flag travels inside the data
- [x] The wrapper's policy has a spec: session handed over, signed out refused, failing and throwing operations caught, non-admin refused
- [x] The dead authorization helper and the dead display-name lookup are gone
- [x] The project guide's authorization section names the wrapper and its exceptions

## Notes
Plan section "Slice 3". Decided: keep `withAuthenticatedUser` (callback now receives `Session = { userId, isAdmin }`), add `withAdminUser`; a plain wrapper, not a function middleware (a middleware short-circuit needs a cast). Private `readSession()` replaces the exported `getAuthenticatedUserId`. Delete `ensureAuthorizedUser`, `requireUser`, `ensureAdminAccess`, `profile.serverfn.ts`, `fetchUsersByDisplayNames`. Inline `poll.service.ts`; drop the double zod parse in `authoring.service.ts`. Exceptions kept: `loginFn`/`signupFn`/`fetchUser`, `visit.serverfn` (ADR-104), the admin route's own server functions (follow-up bean). Consumers unwrapping `data`: PollList, PollDetail, PollEdit — same commit. CLAUDE.md Authorization section rewritten.

## Summary of Changes (2026-09-30)

`authorization.ts`: a private `readSession` reads the Supabase session once into `Session = { userId, isAdmin }` (admin from the allowlist in `adminAuth.ts`, the one place it is decided); `withAuthenticatedUser` hands the session to the operation and reports a throwing operation; `withAdminUser` refuses a non-admin before it runs. Deleted `getAuthenticatedUserId`, `ensureAuthorizedUser`, `requireUser` (poll), `ensureAdminAccess` (authoring), the admin route's two checks, `getUsersByDisplayNames` + `fetchUsersByDisplayNames` + `PublicUser`. Every authenticated server function (archive, look, title, polldex, authoring, poll, run, community, incident, service unlocks, configdex, run history, admin) runs inside the wrapper; `getPollByIdWithOptions` and `getUserPollsOrAll` carry `isAdmin` inside `data` and `hasPollAdminAccess` returns the envelope, with PollList / PollDetail / PollEdit unwrapping accordingly. `authorization.spec.ts` covers the policy (8 cases). CLAUDE.md's authorization section and CONTEXT.md's retired terms updated. Left as is: `loginFn` / `signupFn` / `fetchUser` (pre-session) and the two route-level auth server functions in `logout.tsx` / `callback.tsx`. Admin authority still reads the email allowlist, not `users.role`; switching the source is a product decision, not a refactor.
