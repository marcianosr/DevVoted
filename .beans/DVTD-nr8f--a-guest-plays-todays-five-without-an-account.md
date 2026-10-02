---
# DVTD-nr8f
title: A guest plays today's five without an account
status: todo
type: feature
priority: high
created_at: 2026-10-02T15:41:06Z
updated_at: 2026-10-02T15:41:24Z
parent: DVTD-erjz
---

**What:** A logged-out visitor plays the shared daily five with a real run, and signing in keeps it.

**Why:** Visitors from a shared result leave at the login screen; play first, sign in for permanence.

## Done when
- [ ] A logged-out visitor can play today's five and close a gate
- [ ] Returning on the same device continues the run
- [ ] Linking GitHub keeps the run and unlocks permanence
- [ ] Guests are absent from the community, leaderboards, turnout and hover cards
- [ ] A guest cannot start, abandon or reroll a second run

## Notes
- ADR-178. `signInAnonymously`, convert with `linkIdentity` (GitHub) or `updateUser` (email); the uid is kept, nothing migrates.
- A `users` row for an anonymous id; refusals keyed on the `is_anonymous` claim inside `withAuthenticatedUser`.
- Sign-in offered at the first gate close, the debrief, and the reminder opt-in. Never a wall.
- Scheduled cleanup of stale anonymous users; rate-limit anonymous sign-in or add a captcha.
- RLS (DVTD-5kak) is done, which this needed: anonymous users hold the `authenticated` role.
- Pairs with the logged-out landing page (DVTD-erjz #11).
