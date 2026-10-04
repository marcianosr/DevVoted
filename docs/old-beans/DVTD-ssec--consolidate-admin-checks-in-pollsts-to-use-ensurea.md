---
# DVTD-ssec
title: Consolidate admin checks in polls.ts to use ensureAdmin/isAdminEmail
status: todo
type: task
priority: low
created_at: 2026-05-28T11:50:53Z
updated_at: 2026-05-28T11:50:53Z
---

After DVTD-gvxg promoted admin-check helpers to `src/utils/adminAuth.ts`, `src/domains/polls/api/polls.ts` still defines a private `ensureAdminAccess` (line ~168) and uses inline `ADMIN_EMAILS.includes(... as ...)` casts in 4 places.

## Why

- Consistency with the shared helper
- Removes the last 4 `as (typeof ADMIN_EMAILS)[number]` casts from the codebase (project preference: avoid `as`)

## Scope

- [ ] Replace private `ensureAdminAccess` with imported `ensureAdmin`
- [ ] Replace inline includes-with-cast checks with `isAdminEmail(user.email)`
- [ ] Confirm tests / typecheck pass

Strictly mechanical. No behavior change.
