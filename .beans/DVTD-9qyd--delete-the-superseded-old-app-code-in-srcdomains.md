---
# DVTD-9qyd
title: Delete the superseded old-app code in src/domains
status: in-progress
type: task
priority: normal
created_at: 2026-08-13T11:18:20Z
updated_at: 2026-09-22T18:48:25Z
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

- [ ] Retire the `legacy-*` dependency-cruiser rules — NOT done. `src/domains/` is
      still largely live (the shell, poll authoring, /admin, /stats, /profile), so
      the rules still guard something. Revisit after `DVTD-wj1t`.
- [ ] Drop the `src/domains` exemption in `no-circular-runtime` — NOT done, same reason.
      The `progress.service ↔ turn.service` cycle it hides is still there.
- [ ] `economy/data/configs.ts` (1134 lines) is still live via `/admin`, `Footer` and
      three `src/modules/` files — it cannot be deleted without migrating those.

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
