---
# DVTD-rawb
title: 'Builds are open: read any rival''s installed configs from prep and the climb'
status: completed
type: feature
priority: normal
created_at: 2026-09-23T07:58:20Z
updated_at: 2026-09-23T08:15:21Z
---

ADR-099 §4 refuses a free payload pick *because* "builds are open", and the Marketplace draft (DVTD-8f3i) has a "Builds are public" section, yet nothing in the game showed another player's build: every cross-player read (`fetchActiveRunStats`, `fetchRivalCandidates`) projected counts and footprints only, and wiki §7.1 carried "🟡 Builds, configs and storage are still not shown."

Decided 2026-09-22 with Marciano: a build is public (configs, versions, weight, the vendor lock), a run's answers are not, and it is display only. Recorded as ADR-101 (100 was claimed by the living-record ADR mid-session).

Surfaces: the kanto prep **AttackPanel** rival rows draw the rival's build as chips; the terminal **/run/community climb track** opens a climber's build on hover or tap (fallen included). The kanto community screen is unwired (DVTD-6poh) and inherits the data.

Related: DVTD-8f3i (Marketplace "Builds are public"), DVTD-kgch (death loot reads the same fallen build), DVTD-144r / DVTD-wfkv (their "never who installed what" line is narrowed: the install share stays an aggregate, the build itself is public), DVTD-6poh / DVTD-4km2 (kanto community inherits `build` on its climbers).

## Todo

- [x] `build/domain/publicBuild.model.ts`: `PublicBuild`, `publicBuildOf` (roster-refreshed, unknown ids dropped) + spec
- [x] `climbers.repository.ts`: one `publicBuildColumn`; `fetchActiveClimbers` and `fetchFallenToday` carry `build`
- [x] `incident.repository.ts` `fetchRivalCandidates` carries `build`; `RivalCandidate` → `AttackOffer` → `AttackOfferView`
- [x] `incident.viewmodel.ts` `rivalChipFor`; `AttackRival.build` drawn as bare `ConfigChip`s in `AttackPanel.ui`; fixture + story + spec
- [x] `community.service.ts`: `ClimbClimber.build?`, `ClimbFallen.build`; `"description":` tripwire beside `"correct":`
- [x] `CommunityView.component.tsx` `trackBuildFor`; `TrackClimber.build?`
- [x] terminal `Tooltip` gains `hint: ReactNode` + `open`; `ClimbTrack.ui` chip becomes a button that opens the build on press, hover via the bubble
- [x] ADR-101 (100 was claimed mid-session by the living-record ADR) + README row; wiki §7.1 / §7.4 / glossary; CHANGELOG Added; CONTEXT.md row
- [x] `npm test` (230 files, 4158 passed), `npm run lint` (depcruise clean, wiki synced), `npm run build`

## Follow-ups (not here)

- Climbers folded behind the `+N` badge have no chip to open
- Storage is still not shown
- Kanto `ClimberProps.build` when DVTD-4km2 draws the climb map

## Summary of Changes

- **Domain** `build/domain/publicBuild.model.ts`: `PublicBuild` / `PublicConfig`, `publicBuildOf(stored)` refreshes label and weight from the roster (minified halves it), drops unknown ids, keeps the vendor lock only while its config is installed; `publicWeightOf`. Spec: 6 tests.
- **Infrastructure** `climbers.repository.ts`: one `publicBuildColumn` (`json_build_object` over `state->build`: ids, level, minified, lock, install order). `fetchActiveClimbers`, `fetchFallenToday` and `incident.repository.fetchRivalCandidates` select it and map through `publicBuildOf`. The blob still never leaves Postgres.
- **Incident aggregate**: `RivalCandidate` → `AttackOffer` → `AttackOfferView` carry `build`; `rivalChipFor` turns a `PublicConfig` into a bare `ConfigChip` (no About, no press; vendor badge via `vendorChipFor`). `AttackPanel.ui` draws the strip under each rival's name, or "nothing installed".
- **Community**: `ClimbClimber.build?` (absent only for a viewer whose run has ended), `ClimbFallen.build`; `trackBuildFor` → `TrackClimber.build`. Terminal `Tooltip` gains `hint: ReactNode` + `open`; `ClimbTrack.ui` wraps a chip with a build in a `<button aria-expanded>` whose `aria-label` reads the build in words; a press pins the bubble, hover still works, one open at a time; fallen chips included.
- **Tripwires**: the community payload and the attack offers assert no `"description":` ever ships (no embedded `Config`).
- **Docs**: ADR-101 + README row; wiki §7.1 (🟡 line replaced), §7.4, glossary; CHANGELOG Added; CONTEXT.md `Public build` row. Fixtures: `kantoIncidents.factory`, `ClimbTrack.stories`, `CommunityScreen.stories`, proto-run's simulated rivals.

Follow-ups stay as listed above (`+N` fold, storage, kanto climb map).
