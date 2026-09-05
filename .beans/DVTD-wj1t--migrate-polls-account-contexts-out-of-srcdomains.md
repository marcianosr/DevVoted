---
# DVTD-wj1t
title: Migrate polls + account contexts out of src/domains
status: in-progress
type: task
priority: normal
created_at: 2026-08-12T19:52:09Z
updated_at: 2026-09-04T15:04:02Z
parent: DVTD-u35m
---

Follow-up to DVTD-36ct, which migrated run, collection and shared. What remains is src/domains legacy: polls context (poll reads, answer evaluation, authoring — domains/polls) and account context (auth, profile — domains/users), plus domains/economy and domains/runs which are mostly reachable only via the /old routes that DVTD-7q8l deletes.

Order matters: let 7q8l delete the /old surface first, then migrate what is still alive. Per CLAUDE.md the default remains migrate-a-slice-when-you-touch-it, not wholesale.

## Todo
- [x] After 7q8l: inventory what in src/domains is still imported by live routes
- [x] account: domains/users -> modules/account/{auth,profile}
- [ ] ~~polls: domains/polls -> modules/polls/{poll,authoring}~~ — parked pending DVTD-17b3 audit
- [ ] Retire the legacy-* dependency-cruiser rules as each slice lands

## Account slice landed (2026-08-13)

`src/domains/users/` no longer exists. Its 8 files became
`src/modules/account/{auth,profile}/` per ADR-002 §5.

| was | is |
|---|---|
| `api/queries.ts` | `profile/infrastructure/profile.repository.ts` |
| `api/users.ts` | `profile/application/profile.serverfn.ts` |
| `services/userSync.service.ts` | `auth/application/userSync.service.ts` |
| `components/Auth.component.tsx` | `auth/presentation/Auth.ui.tsx` (renders HTML) |
| `components/Login.component.tsx` | `auth/presentation/Login.component.tsx` (wires only) |
| `components/Avatar.component.tsx` | `profile/presentation/Avatar.ui.tsx` |
| `components/UserTitle.component.tsx` | `profile/presentation/UserTitle.ui.tsx` |

10 importers repointed across routes, modules and the remaining legacy tree.

### One legacy cycle gone

`Login.component.tsx` imported `loginFn` from `~/routes/_authed`, which imported
`Login` to render on an auth error. `loginFn` and `signupFn` now live in
`auth/application/auth.serverfn.ts`, which is where ADR-002 §4.1 puts a
`createServerFn` seam anyway. One of the two cycles the `no-circular-runtime`
rule exempts is retired.

### DVTD-iide closed on the way past

`userSync.service` did raw Drizzle work, which the legacy rule carried as a
named exception. Its queries are now
`auth/infrastructure/user.repository.ts` (`findUserById`, `findUserByEmail`,
`insertUser`, with DTO mapping inside), and the service orchestrates. The
`userSync\.service\.ts$` escape hatch is **deleted** from
`legacy-engine-stays-pure-no-db`, so that rule is now unconditional.

### What the arch rule caught

Moving the files made `routes-only-into-presentation` fire three times, because
`src/domains/` had never been held to it. Each was a real gap:

- `sign-up.tsx` had an inline component -> extracted to
  `auth/presentation/SignUp.component.tsx`; the route is now 7 lines
- `stats.tsx` fetched account data in its loader -> moved behind
  `profile/presentation/SpecialThanksPanel.component.tsx`
- `__root.tsx` defined `fetchUser` inline -> moved to `auth.serverfn.ts`

`stats.tsx` also had a local `ProfileAvatar` used by two blocks; it became
`profile/presentation/CreditList.ui.tsx`, now serving both Poll Editors and
Special Thanks.

**Config change, flagged:** `__root.tsx` is exempted from
`routes-only-into-presentation`. Its `beforeLoad` builds the router context
before any component exists, so the rule's premise (a route mounts a component
and stops) cannot apply. The exemption is one named file with that reason in the
rule comment. Net across this bean the config gained one exemption and lost one,
and the lost one was unconditional debt.

### Two behaviour changes worth knowing

- Special thanks now loads client-side rather than in the stats route loader.
  It is credits, not critical-path content.
- Signup errors and the credits' GitHub links moved off `text-red-400` /
  `text-blue-400` onto cinnabar / cerulean, matching DVTD-8ksp's palette pass.

### Test replaced, not just moved

`userSync.service.spec.ts` asserted that a type literal had the fields it was
written with — three tautologies, no behaviour. Replaced with four cases over
`ensureUserExists`, including the race the try/catch exists for: a concurrent
insert wins, ours violates the unique constraint, and the email lookup finds the
row the winner created.

### Verification

tsc clean · lint clean, 0 violations across 536 modules · 1475 tests passing.

### Still open

`polls` (40 files), `runs` (52) and `economy` (37) remain. `runs` and `economy`
are the larger pair and are still reached from `__root.tsx`, `stats.tsx`,
`seed.ts` and the componentRegistry.

## Direction changed 2026-08-13 (Marciano)

Challenged the premise: *"it's the legacy app, why do you want to migrate that?"* Correct — the remaining todos assume migration is the right verb, and for the old game engine it is not.

Evidence gathered on the spot: `runs/prototype/` is reachable only from a dev rig, and `economy/data/configs.ts` (1134 lines) is superseded by `configRoster.model.ts` (298). Migrating either would move code toward deletion.

The account slice above stands — auth is the app's front door, nothing in `modules/` was replacing it, and it retired a cycle plus DVTD-iide. But it was picked by working down the board rather than by asking what the code is *for*.

**The remaining todos (`polls`, and the legacy-rule retirement) are parked** pending DVTD-17b3 (audit) and DVTD-9qyd (delete). Re-scope this bean to whatever genuinely survives.
