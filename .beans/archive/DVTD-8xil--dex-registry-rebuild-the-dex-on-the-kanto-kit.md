---
# DVTD-8xil
title: 'Dex Registry: rebuild the Dex on the kanto kit'
status: completed
type: feature
priority: high
created_at: 2026-09-15T14:24:54Z
updated_at: 2026-09-15T15:05:03Z
---

`/dex` is the last significant surface still on the retired old-theme/modern-theme kit. Rebuild it as **Dex Registry** on kanto, five tabs instead of four: Gates becomes Swatches, and a new Runs tab surfaces run history that is already fetched and thrown away.

Plan: /Users/marciano/.claude-work/plans/design-the-registry-dex-polished-plum.md

## Decisions

- Title is "Dex Registry" — bare "Registry" is already the shop's offer list (CONTEXT.md:149).
- Swatch names come from `swatch.model.ts`, not the mocks (ids are persisted in `users.owned_swatch_ids`).
- Polls rows read `answered xN`, not `seen xN` — nothing in the run engine writes `polls_history`.
- Audits rows carry their gates, not "fired xN" — `runsFaced` is a hard 0 for every drawn audit (DVTD-gvc9).

## Todo

- [x] kanto `Tabs.ui.tsx` — the kit has no tablist at all
- [x] `correctCount` on `PolldexEntry` (service already computes then discards it)
- [x] Widen the run-history read (no migration; `run_states` denormalises the scalars)
- [x] `runHistory.model.ts` — entries + band derivation via `bandFor`
- [x] `dexScreen.viewmodel.ts` — domain to kanto props
- [x] Five panels: DexPolls, DexConfigs, DexAudits, DexSwatches, DexRuns
- [x] `DexScreen.ui.tsx` shell
- [x] Rewire `Dex.component.tsx`, delete the old-theme path
- [x] Specs + stories
- [x] Docs: wiki 6.4 + glossary, CONTEXT.md:102, CHANGELOG
- [x] Verify: npm test, npm run build, npm run lint

## Summary of Changes

**New kit components** (`src/ui/kanto-theme/`): `Tabs.ui.tsx` (the kit had no tablist at all), `DexScreen.ui.tsx`, `DexPanel.ui.tsx` (the shared header/footer shell), and the five panels `DexPolls`, `DexConfigs`, `DexAudits`, `DexSwatches`, `DexRuns`. `Screen.ui.tsx` gained a `wide` width rung (max-w-6xl) because a collection screen lists rather than decides.

**New module code**: `dex/domain/runHistory.model.ts` and `dex/application/dexScreen.viewmodel.ts`, plus `src/test/dexRegistry.factory.ts`.

**Data**: `correctCount` added to `PolldexEntry` (the service already computed `fullyCorrect` and threw it away). `fetchGateRunsByUser` widened to carry runId, coverage, timestamps and `swatchGatesEarned` (pulled out by JSON path so the state blob stays server-side). `AuditdexEntry` gained `code` and `title` so a row can seat the HTTP code apart from the name. No migration needed.

**Deleted** 28 files: the four dex views, `ConfigdexPanel`, the old-theme `DexScreen`/`PollsPanel`/`GatesPanel`/`AuditsPanel`, and the `Tabs`/`Filter`/`audits` helpers those orphaned.

## The coverage-units trap (worth remembering)

`run_states.coverage` stores **units**, not a ratio or a percentage. `bandFor` takes a ratio. Reading the column directly would report ~4x the truth at the opening gates and flip DANGER to HEALTHY. `runCoverageOf(units, gate)` is the only honest conversion; `runHistory.model.spec.ts` pins it with a case that fails loudly if anyone reverts it. This is the same class of bug as DVTD-znsu.

## Deviations from the mocks, all deliberate

1. Swatch names come from `swatch.model.ts` (Thunder/Rainbow/Soul/Marsh/Seafoam/Earth/Elite/Champion), not the mocks' colour names, which also drift off-by-one from gate 8.
2. Only the *next* gate's swatch is dashed; locked ones are empty sockets, per the "dashed is fillable" law.
3. Polls rows say `answered xN`, not `seen xN`.
4. Audits rows carry their gates, not `fired xN`.
5. Locked configs stay redacted (the mock showed their names); the domain entry carries no config at all, so it is type-impossible to leak one.
6. Counts come from the data: 38 configs and 16 audits, not the mocks' 44 and 19.

## Verification

4458 tests pass, 2 fail. Both failures are in `src/modules/run/gate/domain/gate.model.spec.ts` ("the floor rule") and **pre-exist this work** — confirmed by running that spec at HEAD in a clean worktree. `npm run build` reports 0 TypeScript errors. `npm run lint` passes with no dependency-cruiser violations. Stories swept with a scratch tsconfig for TS2304, clean.

## Follow-ups worth a bean

- The pre-existing `gate.model.spec.ts` floor-rule failures (2), untouched here.
- Real audit-firing counts (DVTD-gvc9) would let the audits tab carry a count again.
- Writing `polls_history` from the run engine would make "seen" a real number.


## Follow-up: version ladders on the configs tab

Answering "do we support upgraded versions": **yes, but they are not an account unlock.** 16 of 38 configs are upgradable (`isUpgradable`). Eleven focus-category configs climb ×1.25 → ×2.25 over 5 versions; `unit-tests` +32KB → +160KB; `moores-law` +2% → +10%; `telemetry`, `git-rebase` and `dependabot` cap at v2 and return an **empty** `figureLabel`, because their upgrade is a behaviour change rather than a figure. There is no per-version text for those three anywhere in the roster (git-rebase only mentions v2 inside its prose `description`), so their rungs show the price and nothing else rather than inventing rules.

Versions are bought with KB inside a run and die with it. `user_config_unlocks` has no level column and nothing records a highest-version-ever-reached, so the Dex shows the ladder as a **catalogue fact**, not progress.

Built: a `v{max}` badge after the config name, wrapped in a kanto `Tooltip` listing every rung with its effect and step price (v1 reads "on install"). The 22 configs with no ladder carry no badge. `versionsOf` in `dexScreen.viewmodel.ts` reuses `figureLabel` and `upgradeStorageCost` rather than recomputing; depcruise allows the cross-context application import.

This closes the wiki's "🟡 Planned: upgrade levels".
