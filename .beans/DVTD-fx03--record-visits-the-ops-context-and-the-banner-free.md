---
# DVTD-fx03
title: 'Record visits: the ops context and the banner-free visitor hash'
status: in-progress
type: task
priority: high
created_at: 2026-09-23T12:57:11Z
updated_at: 2026-09-23T13:08:38Z
parent: DVTD-uwf9
---

Phase 3 of DVTD-uwf9. Fills the app_visits table Phase 2 created.

## Todo

- [x] New context `ops`, aggregate `pulse` (ADR-002 shape), plus its CONTEXT.md row in the same commit
- [x] `visit.model.ts`: Visit, DeviceClass, KNOWN_ROUTE_IDS + isKnownRouteId, deviceClassOf, referrerHostOf — pure strings
- [x] Drift spec: parse routeTree.gen.ts off disk, assert KNOWN_ROUTE_IDS still matches
- [x] `visitor.repository.ts`: the request adapter — IP/UA/country/referer, the date-keyed salt, the hash, same-origin check
- [x] `visit.repository.ts`: the upsert with the hits counter
- [x] `visit.validation.ts` / `visit.service.ts` / `visit.serverfn.ts`
- [x] `findAuthenticatedUserId` in shared/utils/authorization.ts — non-throwing, verifies rather than trusts
- [x] Wire one call site in `__root.tsx` beforeLoad, fire-and-forget, guarded on `preload`
- [x] `VISIT_HASH_SECRET` in .env.sample (Vercel still to set by hand) in .env.sample (and Vercel)
- [x] ADR-103 + its row in docs/adr/README.md
- [x] Verify: typecheck, lint (lint:arch proves ops needs no cruiser change), format, tests, and real rows in the local DB

## Notes

- **One call site, not two.** Root `beforeLoad` is NOT cached per match — `load-matches.js` loops `handleBeforeLoad` over every match unconditionally, skipping only a match already dehydrated from SSR. So it runs server-side on the initial load and client-side on every SPA navigation. No router.subscribe needed.
- Route id comes from `matches.at(-1)?.routeId` — never a pathname, which carries real ids like /runs/482.
- The endpoint is unauthenticated by necessity: seeing signed-out visitors is the point, and beforeLoad runs client-side anyway so requiring a session would blind the /login -> /sign-up funnel. Mitigate structurally: closed route-id set (not a regex), the unique key capping rows per hash per day, hits capped at 500, same-origin check, no response body, never throws.
- userId must be derived server-side. A client-supplied one would be an attribution bypass.

## Summary of Changes

The `app_visits` table Phase 2 created is now filled.

New context `ops`, one aggregate `pulse`, with its CONTEXT.md row in the same commit. `lint:arch` went from 683 to 697 modules with **no dependency-cruiser change**, confirming the rules are generic over context names.

- `domain/visit.model.ts` — `Visit`, `DeviceClass`, `KNOWN_ROUTE_IDS` + `isKnownRouteId`, `deviceClassOf`, `referrerHostOf`, `countryOf`. Pure strings.
- `domain/visitRoutes.spec.ts` — parses `routeTree.gen.ts` off disk and asserts the allowlist still matches, so adding a route fails a test rather than silently losing its visits.
- `infrastructure/visitor.repository.ts` — `readRequestFacts` (the only reader of the request), `visitorHashOf`, `visitorContextOf`, `isSameOrigin`.
- `infrastructure/visit.repository.ts` — the upsert with the hits ceiling.
- `application/` — `visit.validation.ts`, `visit.service.ts`, `visit.serverfn.ts` (`recordVisit` + the fire-and-forget `recordScreen`).
- `findAuthenticatedUserId` in `shared/utils/authorization.ts` — non-throwing, and uses `getClaims()` which verifies the token rather than trusting it.
- One call site: `src/routes/__root.tsx` `beforeLoad`, guarded on `preload`.
- ADR-103 + its row in `docs/adr/README.md`.

### A restructure the tests forced, and it improved the design

The first cut called `getRequestHeader` directly from `readVisitorContext` and `isSameOriginRequest`. Both proved **untestable**: vitest replaces `@tanstack/react-start/server` with an import-protection stub, so the module under test received the literal string `"[import-protection mock]"` no matter what `vi.mock` said — three specs failed with no obvious cause.

The fix was to split the adapter from the policy. `readRequestFacts()` is now the only function touching the request, and every decision below it is a pure function of a `RequestFacts` value. That is the split the layering wanted anyway, and it made the privacy invariants testable instead of unreachable.

### Verification

- **39 tests across the four new spec files**, including the core privacy invariant: the same IP and user-agent hash differently on two different dates, identically within one date, and the hash never contains the address.
- The **generated SQL** was rendered and read: `least("app_visits"."hits" + 1, $8)` and `coalesce(excluded.user_id, "app_visits"."user_id")`.
- That SQL was then **executed against real Postgres** three times for one visitor: signed-out, then signed-in, then signed-out again. Result was one row with `hits = 3`, `user_id` set — born anonymous, upgraded on sign-in, and never downgraded. Probe row deleted.
- `lint` clean (no dependency violations, 697 modules), `format:check` clean.
- My own surface: **10 spec files / 96 tests passing**.

### Note on the concurrent refactor

The full suite and `tsc` currently show failures in `pollScreen.viewmodel`, `PollView.component`, `runView.factory`, `HallOfFame.spec`, `PollScreen.spec` and `run.service.spec`. Those belong to DVTD-zptd's `categoryRecord` -> `categoryLeader` rename, which was in flight at the same time. None are files this bean touched.

### Still to do by hand

- [ ] Set `VISIT_HASH_SECRET` in Vercel (Production + Preview). Until it is set, the recording path is a deliberate silent no-op — no rows, rather than weak ones.
