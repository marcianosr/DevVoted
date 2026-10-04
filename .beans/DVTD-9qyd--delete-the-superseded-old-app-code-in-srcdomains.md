---
# DVTD-9qyd
title: Delete the superseded old-app code in src/domains
status: completed
type: task
priority: normal
created_at: 2026-08-13T11:18:20Z
updated_at: 2026-09-23T09:38:10Z
parent: DVTD-82c4
---

Act on the audit: delete what the new engine replaced, rather than restructuring it into `src/modules/`.

Deleting beats migrating here. No ADR-002 naming decisions, no arch-rule fixes, no repointing importers — the rules stop applying to code that is gone. The account slice (DVTD-wj1t) was worth migrating because auth is the app's front door and nothing was replacing it; the old run engine is a different case.

Expected shape once the audit lands:

- **delete** — old engine (`runs/prototype/`), old config system (`economy/data/configs.ts`, 1134 lines), old scoring/turn/pipeline services, and whatever else is proto-only or unreachable
- **keep and migrate later** — polls authoring, borders
- **retire alongside** — the `legacy-*` dependency-cruiser rules, and the `src/domains/` exemption in `no-circular-runtime` (which currently hides two real cycles: `Login`↔`_authed` is already fixed, `progress.service`↔`turn.service` remains)

Also in scope: `routes/proto-session-slice.tsx` and `routes/proto-run.tsx` are the only consumers of some of this. Decide whether the dev rigs keep earning their keep or go with the code they drive.

## Todo
- [ ] Delete the proto-only and unreachable files the audit names
- [ ] Decide the fate of proto-session-slice.tsx and proto-run.tsx
- [ ] Retire the legacy-* arch rules that no longer have anything to guard
- [ ] Drop the src/domains exemption from no-circular-runtime once the tree is clean
- [ ] Re-scope DVTD-wj1t to whatever genuinely remains

## Progress 2026-09-19 — dead-code sweep landed

Method: rebuilt the import graph from `src/routes/**` + `scripts/**` + the db
entrypoints rather than grepping. Grep lies here — orphaned files import each other.

**Deleted from `src/domains/` (17 files):**
`economy/api/{configs,handlers,queries,shopOfferings}.ts`,
`polls/api/communityStats.ts`, `polls/hooks/useCountdownToNextPoll.ts`,
`polls/models/pollResponses.model.ts`, `runs/api/reroll.ts`,
`runs/hooks/{useApplyPipelineUpgrade,useLootFallenRun}.ts`,
`runs/utils/{formatPipelineRequirement,parseCompletionReason}.ts`, and the whole
`runs/prototype/` (5 files).

**Dev rig decided:** `routes/proto-session-slice.tsx` deleted (750 lines, its own
header called it THROWAWAY). It was the sole importer of `runs/prototype/`, whose
engine duplicated eight identifiers now owned by `modules/run` (`SLICE_WINDOW`,
`VICTORY_GATE`, `gatePassed`, `coverageForAnswer`, `isBare`, …).
`routes/proto-run.tsx` **stays** — it is the reference rig for the kanto kit and
already redirects in PROD.

Also removed outside `domains/`: `shared/utils/sentry.ts` (3-line re-export, zero
importers — everything imports `@sentry/react` directly),
`modules/account/profile/presentation/UserTitle.ui.tsx`,
`modules/run/community/application/usePollSplit.hook.ts`,
`modules/run/run/application/useUpcomingCategories.hook.ts`.

**A correction to the earlier audit assumption:** `src/database/seed.ts` no longer
exists — it is now `src/database/seed/index.ts` (`db:seed` points there). Any
reachability script that hardcodes the old filename will report the entire seed
directory as dead. It is not.

## Still open on this bean

- [x] Retire the `legacy-*` dependency-cruiser rules — **done 2026-09-23** with
      DVTD-wj1t. `LEGACY_FROM` and all three rules deleted;
      `ui-stays-presentational` and `shared-not-into-modules` narrowed from
      `^src/(modules|domains)/` to `^src/modules/`. Config 187 -> 151 lines, and it
      gained no exemptions in exchange.
- [x] Drop the `src/domains` exemption in `no-circular-runtime` — this was already
      done on this bean; the cycle it hid died with the old engine.
- [x] `economy/data/configs.ts` — deleted on this bean; what remained of `economy/`
      was borders + archive, now `modules/account/profile/`.

## Blocker corrected 2026-09-22

This bean was still marked `blocked_by: DVTD-17b3`. **DVTD-17b3 is completed and
archived** — the gate had been open for some time and nothing said so. Link removed.

The real blocker is narrower and worth stating precisely, because it is what the three
remaining items all wait on:

`src/domains/economy/data/configs.ts` (1134 lines) has **13 import sites across 11
files**, and two of them are live production code, not legacy:

- `src/routes/_authed/admin.tsx:8` — a live route
- `src/components/Footer.component.tsx:5`

plus `configManager.service`, `shopOfferings.service`, `configSelection`,
`turn.service`, `progress.service`, `runs/api/runs.ts`, `categoryWeight.service`, and
two specs.

So the order is forced: **migrate `/admin` and `Footer` off the legacy config data
first**, then the file can go, and only then do the last two items become possible:

- the three `legacy-*` rules in `.dependency-cruiser.cjs:150,160,173` still guard live
  code, so they cannot retire yet
- the `src/domains` exemption in `no-circular-runtime` still hides
  `progress.service ↔ turn.service`

Remaining under `src/domains/` as of today: polls **35**, runs **42**, economy **28**.

## Cleanup pass 2026-09-23 — reachability re-run

Rebuilt the import graph twice: once from all routes, once from ONLY the
new-concept entrypoints (proto-run + /run/* + dex + community + incidents).

**The new concept's entire debt to src/domains is 10 files:** borders.ts +
border.model.ts (via Avatar.ui.tsx and 3 modules/run repositories), the archive
slice (archive.{ts,handlers,queries} + useArchiveState + ArchiveSummary +
BorderShop, via /dex and /profile), pollAnswerEvaluation.service.ts (30 lines,
pure, via polldex.service) and score.service.ts — which survives on ONE type
edge, schema.ts:368 `$type<import(...).ScoreCalculation>()`.

The other 95 files are old-app only. What holds them up is not the new game:
polls/api/polls.ts has 5 zero-consumer exports whose only job is to import
dailyPoll.handlers (the doorway to turn.service -> progress.service -> the old
scoring stack), and admin.handlers.ts has one zero-consumer export
(getCategoryWeightsHandler) reaching categoryWeight.service + shop.queries and
through them configs.ts.

Plan: /Users/marciano/.claude-work/plans/i-want-to-cleanuo-refactored-newell.md

## Landed 2026-09-23 — the old engine is deleted

133 files changed, ~16,550 deletions. src/domains: **105 -> 29 files**.
`src/domains/runs/` no longer exists; only `economy/` (borders + archive, 9)
and `polls/` (authoring, 20) remain.

Verified after every step: **201 test files / 3776 tests pass**, `lint:arch`
clean (**742 modules**, down from 827), `npm run build` green.

### What actually held it up
Five zero-consumer exports in `polls/api/polls.ts` (`getDailyPoll`,
`postPollOptions`, `getPollsSeenInRun`, `getRunPollHistoryServerFn`,
`getPollById`) importing `dailyPoll.handlers`, plus `getCategoryWeightsHandler`
in `admin.handlers.ts`. ~55 lines. `pollResponse.queries.ts` went 443 -> 28
lines (only `hasUserAnsweredPoll` had a caller) which severed the last runtime
edge into `domains/runs/`.

### Corrections to the plan, found while executing
- `poll.mock.ts`/`pollOption.mock.ts` were NOT dead — they feed the surviving
  half of `handlers.spec.ts`. Renamed to `.factory.ts` (ADR-002 §4.2) and kept.
- `answerScore.viewmodel.ts` and `modules/run/run/domain/run.factory.ts` were
  NOT dead — 5+ live module specs import them. A route-graph walk cannot see
  spec imports; every fixture file needs a second pass over spec edges.
- `/admin` could NOT be rewired to `CONFIG_LIST`: the new roster has **no
  `rarity` field**. The config browser section was deleted instead.
- kanto `Confirm`/`Modal`/`Uninstall` left in place — `Panel.spec`,
  `ShopScreen.stories` and `kantoPoll.factory` all import them.
- `runs/api/queries.spec.ts` only *mocked* `debitArchivedStorageGuarded`;
  `archive.queries.spec.ts` has a real 5-test block, so no coverage was lost.

### Guard rails retired
- `no-circular-runtime`: the `src/domains/` exemption is **dropped** — the
  `progress.service <-> turn.service` cycle it hid is deleted. Lint still clean.
- `DEV_RIG_ROUTES` narrowed to `proto-run` only (proto-session-slice is gone).
  It is still required: proto-run legitimately imports `modules/*/domain/`.
- The three `legacy-*` rules **stay** — they still guard the two live slices.
- `sonar-scanner.cjs` stale `src/test/utils.tsx` entries removed.

### Also done
- Bug fixed by removal: `__root`'s nav could end a **new-engine** run through
  the **legacy** finish path (`run.queries.ts` never filtered on `mode`).
- The talk deck is self-contained: `src/presentation/demo/` holds frozen copies
  (deliberately not tracking the live roster).
- `ScoreCalculation` extracted to `src/database/scoreBreakdown.ts`.
- Four `@deprecated` tables in schema.ts had blockers that no longer exist —
  notes updated; those tables are now droppable (DVTD-lzds).
- `admin.tsx`: `user.email as any` replaced with `isAdminEmail` in adminAuth.

### Still open
- [x] polls slice -> `src/modules/polls/{poll,authoring}/` (DVTD-wj1t, landed 2026-09-23)
- [x] economy slice -> `src/modules/account/profile/` (same bean; `economy` retired as a name)

Both warnings above proved correct: the dead-code cut came first, and
`routes-only-into-presentation` fired on all four /polls routes plus
`profile.$userId.tsx`. See DVTD-wj1t for what each one was hiding.

## Closed 2026-09-23

The last item on this bean was the `legacy-*` rule retirement, and it could not
land until `src/domains/` was empty. DVTD-wj1t emptied it. `src/domains/` no
longer exists, ADR-002 §10 no longer carries it as a standing exception, and
`lint:arch` runs one rule set over 755 modules with no legacy carve-out.
