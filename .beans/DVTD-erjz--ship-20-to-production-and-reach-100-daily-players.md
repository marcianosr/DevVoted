---
# DVTD-erjz
title: Ship 2.0 to production and reach 100 daily players
status: todo
type: epic
priority: critical
created_at: 2026-09-30T18:50:26Z
updated_at: 2026-10-03T15:50:57Z
parent: DVTD-u35m
---

**What:** Everything that stands between this branch and 100 daily players, in priority order.

**Why:** The backlog treats 2.0 as a feature problem, but what is missing is safety to ship, a front door, and a reason to come back tomorrow.

## Done when
- [x] Nobody can read or write a table with the public key alone (DVTD-5kak; live once merged)
- [ ] A fresh database can be rebuilt from migrations, and the cutover is rehearsed on a copy of production
- [ ] A spent day never ends in a raw error or a dead press
- [ ] A stranger can play today's run before signing up, and keep it by signing up
- [ ] We can count unique players per day and read retention after one day and after seven

## Notes

Goal: 100 DUA by the end of 2026 (about 3 months from 2026-09-30). The branch is 248 commits ahead of `main` (v1.3.0). The old game is live and known, so the soft launch is a cutover for existing players, not an introduction.

### P0: blockers (before merging to main)
1. **RLS is absent.** `VITE_SUPABASE_ANON_KEY` ships to the browser, and no migration defines a policy, so Supabase's REST API exposes every public table. Enable RLS with no policies on every table (Drizzle uses the service connection, so the app keeps working), add a guarded migration, and add a CI check that fails when a table lacks RLS. Verify: `curl $SUPABASE_URL/rest/v1/users -H "apikey: $ANON"` is denied or empty.
2. **The base schema exists only through `db:push`.** No migration creates the base tables, and the migrations skip themselves on a fresh database ("Base schema not yet initialised"), against ADR-012. Write a baseline migration from `supabase db dump` of prod. Evidence (2026-10-02): `supabase migration up` on a push-built local database replays from 2025 and dies at `20251204120000_add_daily_polls_table.sql` (`invalid input value for enum status: "open"`; the enum no longer holds it). Make that statement replayable (compare `status::text`) or fold it into the baseline. The `*.spec.ts` files in `supabase/migrations/` are skipped noisily by the CLI; consider moving them.
3. **Rehearse the cutover** on a copy of prod: all 26 pending migrations in order, the legacy grants (titles, archive bonus, category backfill) are idempotent, `mode='calendar'` history survives, and there's a written rollback note. The rest of DVTD-n1dn: a major-version path in `release-decision.ts`, a readable 2.0 changelog (DVTD-d1ei), and `docs/production-release.md` matching `main.yaml`.
4. **A spent day breaks the loop:** DVTD-ecjo, DVTD-3q07, DVTD-p0db.
5. **Legal minimum:** a privacy page (it says the analytics are first-party and use no cookies), terms, and account deletion (GDPR).
6. **See day one:** finish DVTD-0c8e (server Sentry) and DVTD-k8rp (post-deploy checks). `VISIT_HASH_SECRET` and the Sentry DSN are set in prod (confirmed 2026-10-03).
7. **Housekeeping:** delete the Firebase admin key in `scripts/` and drop the `firebase-admin` dependency (the polls are already imported).

### P1: soft launch to existing players, Kabisa and warm intros (target 30-50 DUA)
8. A one-time in-app notice for returning players: new game, same daily five.
9. Finish or park the 13 in-progress beans before merging. The branch only gets riskier.

### P1: the funnel (before the HN/Reddit spike)
10. **Play before sign-up.** Use Supabase anonymous sign-in (`signInAnonymously`), then convert with `linkIdentity` (GitHub) or `updateUser` (email).
    - The guest has a real `auth.uid()`, so `getAuthenticatedUserId()`, `run_states` and the server functions work unchanged. Converting keeps the user id, so there's nothing to migrate.
    - Scope decided in ADR-178, built in DVTD-nr8f: a guest plays today's five every day with one real run; the account buys permanence and identity. Sign-in is offered, never forced.
    - Anonymous users get the `authenticated` role, which is why #1 is not optional.
11. **A logged-out landing page.** `/` currently redirects logged-out visitors to `/login`. One screen with the pitch, a short demo and "Play today's 5", which leads into #10.
12. **First-run orientation:** staged onboarding (ADR-026) exists only on paper. Test with 3 people from outside Kabisa.
13. **A reason to return:** an automated opt-in daily reminder (a Vercel cron and Resend; today it's a manual admin email), and a visible daily reset (DVTD-g7ut).
14. **A share loop:** a postable daily result (DVTD-ixjg) and an OG image (`seo.ts` supports one, but the root route doesn't pass it).

### P2: operate it
15. Per-user rate limiting on server functions that write. Turn on sign-up email confirmation (`enable_confirmations = false` today) or add a captcha.
16. A DUA and D1/D7 readout from the pulse work (DVTD-fx03).
17. Decide who writes polls after launch (the admin check is two hardcoded emails in `adminAuth.ts`). Community polls (DVTD-ofah) come later.

### Frozen until after launch
New config beans (~40), marketplace, team runs, packs and monetization, the deepening pass (DVTD-y3vn), and the cosmetic in-progress beans (DVTD-su6a, DVTD-fdmd, DVTD-iru4).

### Sequencing
P0, then merge, then soft launch, then P1 funnel, then the HN/Reddit spike, then measure D1/D7. Retention, not the spike, decides whether this reaches 100.

### Status 2026-10-03
Checked against the code: P0 #2, #3, #4 and #6 are still open; #1 is done. #5 (legal) and #7 (Firebase key) are skipped at Marciano's call. Risk accepted: GDPR deletion requests become manual SQL, and the Firebase key stays in git history unless it is revoked in GCP.
