# ADR-104: Visits are counted without a banner

## Status

Accepted — 2026-09-23 (Marciano, DVTD-uwf9). Live: `app_visits`, the `ops`
context, and one call site in `src/routes/__root.tsx`.

## Context

DevVoted knew nothing about who showed up. Every table starts at the point
someone already has an account, and the app is entirely behind auth — `/`,
`/login`, `/sign-up` and `/auth/callback` are the only public routes — so anyone
who landed and left was invisible. The game funnel was already answerable from
`polls_responses`, `runs` and `run_states`; the visit funnel had no source at all.

The hard constraint was no banner, no popup, nothing a player ever sees. A
third-party tracker was considered and declined: Vercel Analytics and Plausible
would both have worked and neither needs consent, but neither can join a visit to
run state, which is the question a game designer actually asks.

## Decision

### 1. Nothing is stored on the visitor's device

No cookie, no `localStorage`, no `sessionStorage`, no identifier of any kind. The
ePrivacy consent requirement is triggered by storing or accessing information on
terminal equipment, so it is never engaged and no banner is owed.

The visitor identity is instead computed server-side:

```
visitor_hash = HMAC-SHA256(HMAC-SHA256(VISIT_HASH_SECRET, date), ip + "\n" + user-agent)
```

The IP is never stored. The key is re-derived from the calendar date, so it
rotates at local midnight with no scheduler and no stored state.

**The cost is real and permanent: signed-out retention cannot be measured.**
Rotation is exactly what removes cross-day linkage, and cross-day linkage is
exactly what a returning-visitor metric needs. You cannot have both. Retention is
measurable for accounts, via `users.created_at`; for anonymous visitors the
honest metric is new landings per day.

A missing `VISIT_HASH_SECRET` makes the whole path a silent no-op, so a
misconfiguration reads as no data rather than as weak data.

### 2. A row is a visitor's day on one screen, not a page view

`app_visits` is unique on `(visit_date, visitor_hash, route_id)` and counts
repeats in `hits`.

This bounds the table by construction at (visitors × screens) per day — a ceiling
of ~3,600 rows/day at 150 daily visitors, realistically ~800 — so no rollup table
is needed at 100 or even 1,000 daily users. It also makes the abuse cap free: an
unauthenticated endpoint that can only ever write |routes| rows per hash per day
needs no rate-limit bookkeeping.

What it gives up is ordering. There is no screen-sequence funnel and no session
duration. "Daily visitors and what they do" does not need either; add an
append-only events table if a question ever genuinely requires one.

### 3. The column is a route pattern, never a URL

`route_id` stores `/_authed/runs/$runId`, never `/runs/482`. It comes from the
matched route, not the resolved pathname, so no id and no query string can reach
the table. `KNOWN_ROUTE_IDS` is a closed allowlist checked against the generated
tree by a spec, not a regex: an unauthenticated endpoint must reject a forged id
outright rather than let junk inflate the funnel.

### 4. One call site

Root `beforeLoad` re-runs on every navigation — it is not cached per match the
way a loader is. So `src/routes/__root.tsx` alone covers the entry visit
(server-side, during SSR) and every screen change after it (client-side), and
there is no router subscription.

The endpoint takes no session, deliberately. Requiring one would blind the
`/` → `/login` → `/sign-up` sequence this exists to measure, and `beforeLoad`
runs client-side anyway, so it is an HTTP endpoint either way. The user id is
read from the verified session server-side and never accepted from the caller.

## Consequences

- The pre-signup funnel becomes visible for the first time.
- Recording is fire-and-forget and swallows every failure: it hangs off every
  navigation the app serves, so a dead counter must never slow one or break one.
- A new fifth context, `ops`. `Analytics`, `Telemetry` and `Uptime` are all
  config names in the roster, so the product-side word had to be a different one.
- `readRequestFacts` is the only function touching the incoming request, because
  `@tanstack/react-start/server` is replaced by import protection under vitest.
  Every decision downstream is a pure function of a `RequestFacts` value, which
  is what makes the identity rules testable at all.
