---
# DVTD-wj1t
title: Migrate polls + account contexts out of src/domains
status: completed
type: task
priority: normal
created_at: 2026-08-12T19:52:09Z
updated_at: 2026-09-23T09:37:43Z
parent: DVTD-u35m
---

Follow-up to DVTD-36ct, which migrated run, collection and shared. What remains is src/domains legacy: polls context (poll reads, answer evaluation, authoring — domains/polls) and account context (auth, profile — domains/users), plus domains/economy and domains/runs which are mostly reachable only via the /old routes that DVTD-7q8l deletes.

Order matters: let 7q8l delete the /old surface first, then migrate what is still alive. Per CLAUDE.md the default remains migrate-a-slice-when-you-touch-it, not wholesale.

## Todo
- [x] After 7q8l: inventory what in src/domains is still imported by live routes
- [x] account: domains/users -> modules/account/{auth,profile}
- [ ] ~~polls: domains/polls -> modules/polls/{poll,authoring}~~ — parked pending DVTD-17b3 audit
- [~] ~~Retire the legacy-* dependency-cruiser rules as each slice lands~~ — duplicate, owned by **DVTD-9qyd**

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

`polls` (35 files), `runs` (42) and `economy` (28) remain — recounted 2026-09-22. `runs` and `economy`
are the larger pair and are still reached from `__root.tsx`, `stats.tsx`,
`seed.ts` and the componentRegistry.

## Direction changed 2026-08-13 (Marciano)

Challenged the premise: *"it's the legacy app, why do you want to migrate that?"* Correct — the remaining todos assume migration is the right verb, and for the old game engine it is not.

Evidence gathered on the spot: `runs/prototype/` is reachable only from a dev rig, and `economy/data/configs.ts` (1134 lines) is superseded by `configRoster.model.ts` (298). Migrating either would move code toward deletion.

The account slice above stands — auth is the app's front door, nothing in `modules/` was replacing it, and it retired a cycle plus DVTD-iide. But it was picked by working down the board rather than by asking what the code is *for*.

**The remaining todos (`polls`, and the legacy-rule retirement) are parked** pending DVTD-17b3 (audit) and DVTD-9qyd (delete). Re-scope this bean to whatever genuinely survives.

## Re-scoped to todo (2026-09-22)

Moved off `in-progress`. The bean's own "Direction changed 2026-08-13" section already
says the remaining work is **parked**, and a parked bean is not in progress — it was
reading as active work that nobody was doing.

What is genuinely settled: **the account slice is done.** Verified today —
`src/domains/account/` no longer exists, and `src/modules/account/` holds `auth/` and
`profile/`, each with `application/`, `infrastructure/` and `presentation/`. That slice
also retired DVTD-iide and one unconditional dependency-cruiser escape hatch.

Two corrections to the body above:

- **The counts drifted.** `src/domains/` today is polls **35**, runs **42**, economy **28**
  (105 files), not the 40/52/37 recorded when this was written.
- **"Retire the legacy-* rules" is a duplicate.** DVTD-9qyd carries the same item and is
  the bean actually positioned to do it, so it is struck here. One owner per item.

DVTD-17b3 (the audit this waited on) is completed and archived. The real blocker is now
named on DVTD-9qyd: `src/domains/economy/data/configs.ts` has 13 import sites including
the live `/admin` route and `Footer.component.tsx`, so nothing further can move until
those two migrate.

## Summary of Changes — landed 2026-09-23

**`src/domains/` no longer exists.** The last 29 files became
`src/modules/polls/{poll,authoring}/` and `src/modules/account/profile/`.
Verified at every step: **200 test files / 3775 tests**, `tsc --noEmit` clean,
`npm run build` green, `lint:arch` clean at **755 modules**.

### Step 0 — dead code cut in place first

Per the warning carried on DVTD-9qyd: nothing forbids `modules/ -> domains/`, so
moving before deleting would have hidden the problem behind a green lint.

- `archive.queries.ts`: `creditArchivedStorage` (zero references — `run.repository.ts`
  already credits inline), `debitArchivedStorageGuarded` (spec-only) and `DbExecutor`.
  Its guarded-UPDATE SQL and TOCTOU rationale are recorded on **DVTD-lqjt** first.
- `poll.model.ts` / `pollOption.model.ts`: six unused DTO mappers plus both
  `*Factory` wrapper objects — only `.toDTO` and `.toDTOs` ever had callers.
- Both test factories: `createMockPollRecord`, `createMockPollOptionRecord`.
- `schemas.ts`: nine of eleven exports. Three of them (`pollSubmissionSchema`,
  `createPollSchema`, `userResponseSchema`) were kept alive **only by their own
  spec** — dead schemas with tests.

### Tests replaced, not just deleted

`schemas.spec.ts` tested three dead schemas and neither live one.
`poll.validation.spec.ts` now has 9 tests over `createPollWithOptionsSchema` and
`updatePollSchema` — the two that actually run on every create and update.
`poll.handlers.spec.ts` became `poll.service.spec.ts` (6 tests), moved off
`resetAllMocks` and fixed a call that passed `4` as a `pollId` while meaning a count.

### `economy` is gone as a name

Borders and the archive went to **`account/profile`**, not a fifth context:
`archived_storage`, `owned_border_ids` and `equipped_border_id` are all columns on
`users`, which `profile.repository.ts` already owns. One aggregate, one table.
`border.model.ts` **must** sit in `domain/` — three `modules/run/*/infrastructure/`
repositories import `findBorderById` at runtime and `infrastructure-stays-below`
permits only `domain/`.

### What the arch rule caught, exactly as predicted

`routes-only-into-presentation` fired the moment the server functions landed under
`modules/`. Every hit was a real gap that `src/domains/` had been hiding:

- `profile.$userId.tsx` reached an application hook -> `ProfilePage.{component,ui}.tsx`; route is now 13 lines.
- All four `/polls/*` routes -> `authoring/presentation/`. **~480 route lines became 40.**
- `$pollId/index.tsx` and `$pollId/edit.tsx` lost their `loader:`; data moved to
  `useQuery` (with `retry: false`, so an access error does not retry three times).
  Same call DVTD-9qyd made for `stats.tsx`; `/polls/` index already fetched this way.
- `edit.tsx` lost its `beforeLoad` guard, which declared a `createServerFn` inline.
  It is now `hasPollAdminAccess` + a render branch. **No security change** —
  `updatePoll` still calls `ensureAdminAccess` and `getPollByIdWithOptions` still
  enforces creator-or-admin server-side. The route guard was always UX only.

### ADR-010 splits

`PollForm` 370 lines -> `PollForm.ui.tsx` (343, all markup, `COPY` per ADR-102) +
`PollForm.component.tsx` (160, eight `useState` and the handlers). Also
`PollList`, `PollDetail`, `PollEdit`, `ArchiveSummary`, `BorderShop`, `BorderCard`,
`PollFormPage`. No Stories: CLAUDE.md exempts admin tooling.

### Re-classifications (ADR-002 §5)

- `pollAnswerEvaluation.service.ts` -> `poll/domain/pollAnswer.model.ts`. Pure
  function, no collaborators: deleting it loses *a concept*, not *an action* —
  the same call the ADR records for `seed.service.ts -> seed.model.ts`.
- `pollCreator.model.ts` **deleted**; `PollCreator` is now a row type on
  `poll.repository.ts`, matching `PublicUser` and `PolldexPollRow`.
- DTO mapping moved into the repositories per §5 ("mapping lives INSIDE this file"),
  which also removed the `database/schema` import from `domain/`.

### `as` casts removed (hard rule)

Five, all in files being touched anyway: three
`email as (typeof ADMIN_EMAILS)[number]` -> `isAdminEmail`; `user.email as any` in
`edit.tsx` -> the same; `opt.id as number` -> an `isExistingOption` type guard; and
the two `<select>` handlers now look the value up in `CATEGORY_CODES` /
`statusOptions` instead of casting.

### Guard rails retired

`.dependency-cruiser.cjs` **187 -> 151 lines**. `LEGACY_FROM` and the three
`legacy-*` rules are deleted; `ui-stays-presentational` and
`shared-not-into-modules` narrowed from `^src/(modules|domains)/` to
`^src/modules/`. The config gained **no** exemptions — ADR-002 §10 is down to the
`proto-run` dev rig and `__root.tsx`. Docs updated: ADR-002 §2/§7/§9/§10,
CONTEXT.md, CLAUDE.md.

### Also worth knowing

- Four query keys centralised (`pollQueryKeys.list/authored/creators/adminAccess`);
  `["user-polls"]`, `["poll-creators"]` and `["all-polls"]` string literals are gone.
- `updatePollOptionSchema` now `.extend()`s `newPollOptionSchema` instead of
  restating it; the two `.refine` blocks share one predicate.
- `profile.repository.ts` shares one `archiveColumns` object across select and
  returning, replacing four duplicated column blocks.
- `PollForm`'s single-answer handler mutated its state array in place; the
  extracted version is pure.
- `routeTree.gen.ts` dropped `/stats` — that route was already deleted on this
  branch, the generated tree just had not been regenerated.
- Filed **DVTD-mcxk**: creating a poll silently drops its explanation. Pre-existing
  (the old `createPollInputSchema` had the same omission), carried across rather
  than fixed silently.
- `src/presentation/slides.ts` still says `src/domains/` — frozen talk-deck content,
  deliberately left (DVTD-9qyd).

### Not verified

The four `/polls/*` screens and `/profile/$userId` have no test coverage and were
not exercised in a browser. Needs a playthrough: list filters, create, detail,
edit as admin and non-admin, border purchase/equip/unequip.
