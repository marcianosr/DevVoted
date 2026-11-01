---
# DVTD-qnxv
title: Play as guest returns to the login screen
status: completed
type: bug
priority: critical
created_at: 2026-11-01T12:43:05Z
updated_at: 2026-11-01T12:43:05Z
---

**What:** Pressing Play today without an account lands the player in the run.

**Why:** Every guest after the first was sent back to the login screen, which blocks every new player from Reddit.

## Done when
- [x] A new guest lands in the run
- [x] A spec covers a guest whose session has an empty email
- [x] The changelog states the fix

## Notes
- Found 2026-11-01 in production. Supabase gives an anonymous user email as an empty string. fetchUser passed it on with ?? null, which keeps an empty string, so insertUser wrote email ''. users.email is unique: Postgres allows many NULLs but one ''. The first guest got in; every later insert failed, fetchUser swallowed the error and returned null, and the authed route showed the login screen again.
- Sentry: operation ensureUserExists.insert, Failed query: insert into users ... params ...,MildScizor5732,,true,...
- Fix: ensureUserExists turns a blank email into null before any lookup or write.
- Guests whose auth session exists without an app row recover on their next visit: fetchUser inserts them with email null.
