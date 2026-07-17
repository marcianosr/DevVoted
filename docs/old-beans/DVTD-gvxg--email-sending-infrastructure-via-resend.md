---
# DVTD-gvxg
title: Email sending infrastructure via Resend
status: todo
type: feature
priority: normal
created_at: 2026-05-28T11:46:15Z
updated_at: 2026-05-29T07:52:32Z
---

Scaffold transactional email infrastructure for DevVoted. Uses TanStack Start server functions to call Resend's HTTPS API directly (no Supabase Edge Functions — we already have a server).

## Scope (intentionally minimal)

- New domain: src/domains/email/
- Pure send service (fetch-based, no SDK dep)
- One example template (re-engagement / "come back and play today's poll")
- Server function entrypoint (admin-only initially)
- Test for the send service
- Env var wiring: RESEND_API_KEY, EMAIL_FROM_ADDRESS

## Out of scope (deliberately)

- Scheduled sends (pg_cron / external scheduler)
- DB-trigger-driven sends (webhooks → Edge Function)
- Marketing/broadcast list
- Per-user "email me" preferences UI
- Bounce/complaint handling
- Real Resend account setup (user's job)

## Todo

- [x] Create domain folder structure
- [x] Models: Email type + EmailTemplate type
- [x] Service: sendEmail.service.ts (fetch wrapper)
- [x] Validation: Zod schema for send input
- [x] Template: reengagement template (subject + html)
- [~] Decision function: shouldSendReengagement (stub in place, awaiting user implementation)
- [x] Server function: sendTransactionalEmail (admin-only)
- [x] Test: sendEmail.service.spec.ts (7 tests, all passing)
- [x] .env.sample entry for RESEND_API_KEY + EMAIL_FROM_ADDRESS
- [ ] README note: how to wire Resend in Supabase Auth SMTP settings (for auth emails)


## Notes

- Promoted `ensureAdmin()` + `isAdminEmail()` from polls.ts inline pattern into `src/utils/adminAuth.ts`. polls.ts still uses its private copy — consolidation is a separate follow-up.
- shouldSendReengagement.ts is intentionally a stub: the decision (which dormant users get a nudge today) is a game-design call.
