---
# DVTD-uwf9
title: 'Observability: first-party usage tracking and app health'
status: in-progress
type: epic
priority: high
created_at: 2026-09-23T12:28:10Z
updated_at: 2026-09-23T12:28:10Z
---

Know who shows up each day and what they do, and know when the app is unhealthy — with no banner, popup or consent prompt ever shown to a player.

Decisions taken (2026-09-23):
- Visitor counting: first-party only. No Vercel Analytics, no Plausible, no third party.
- Reading surface: an in-app Pulse panel under a new `ops` context.
- Uptime: Sentry alerts only, no /health endpoint. Accepted consequence: total downtime reaches us via a player, not an alert.

Full plan: ~/.claude-work/plans/i-m-looking-to-track-quiet-snowglobe.md

## Why now

Three gaps found in the codebase:
1. Sentry is blind server-side. `@sentry/react` (browser SDK) is the only one installed; 5 of 6 `captureException` sites run on the server where no client was ever bound. Every server-function failure is invisible.
2. The app is 100% behind auth, so nothing is known about anyone who lands and leaves before signing up.
3. `users` has no timestamp columns at all, and `user_config_unlocks.first_installed_at` is declared but never written or read.
