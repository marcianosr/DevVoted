---
# DVTD-25es
title: /run throws a hydration mismatch once the day is spent
status: in-progress
type: bug
priority: high
created_at: 2026-10-06T07:34:52Z
updated_at: 2026-10-06T08:06:48Z
---

**What:** A full page load of the run hub crashes hydration (React #418) once the player has answered all of today's polls.

**Why:** The production hub throws on every reload in that state, so the server and client disagree about the first screen.

## Done when
- [ ] Reloading the run hub after the day's polls are done logs no hydration error
- [ ] A hydration error in production reaches Sentry with the component that mismatched
- [ ] A spec hydrates the culprit against its server markup without a recoverable error
- [ ] The changelog states the fix

## Notes
Prod error: Minified React error #418 args text. Redirect after the last poll is client-side; the mismatch shows on a hard load of /run only.

Ruled out locally (dev and node-server prod build, seeded login in the same day-spent state): server TZ UTC vs Amsterdam, browser TZ UTC, admin flag, CPU throttle 4x/10x, delayed route chunks, instant server-function responses, reload after client nav from gate/wiki/community. A same-origin iframe load in the owner's prod browser also hydrated clean; only the owner's top-level tab throws.

Prod server HTML for the hub is the loading state ("Loading today's climb…", nav badge 5), identical to local.

Step one (this branch): the client entry passes onRecoverableError to hydrateRoot, reporting through errorReporting with React's component stack, so the next prod mismatch names its component in Sentry (operation tag react.recoverable). Fix and changelog entry follow once Sentry names it.
