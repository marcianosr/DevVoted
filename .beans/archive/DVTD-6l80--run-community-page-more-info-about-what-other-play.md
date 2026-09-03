---
# DVTD-6l80
title: 'Run community page: more info about what other players did'
status: completed
type: feature
priority: normal
created_at: 2026-07-19T07:44:48Z
updated_at: 2026-08-07T10:10:44Z
parent: DVTD-h175
---

The /run/community page shows vote splits per poll but little else. Surface more of what other players did: their progress, builds/configs, storage, how far they climbed. Related: DVTD-wii3 (older community screen bean).

## Summary of Changes

Built **The climb today**, a gate-track map at the top of `/run/community`.

**Data** — `src/modules/run/api/climb.queries.ts` (new): `fetchActiveClimbers`, `fetchClimbMarker`, `fetchFallenToday`, `fetchPersonalBestPosition`. All read `run_states`' denormalized scalars; depth into the current gate comes out of the state blob via a Postgres JSON path, so the server-only snapshot never leaves the DB. `community.handlers.ts` gained `ClimbTodayView` / `ClimbClimber` / `ClimbFallen` and builds the map before the poll board's early returns, so it renders on a day with nothing answered yet.

**Geometry** — `src/modules/run/climb/climbMap.model.ts` (new): every marker reduces to one unit, polls (`gate * 5 + pollsIntoGate`), plus window paging and the footer copy. Pure, 25 unit tests.

**UI** — `ClimbToday.ui.tsx` (new) mounted above `RunCommunityBoard`. Avatars above the line, greyed-out avatars below it where runs died today, a dashed ghost for your deepest finished run, and a hatched **uncharted** zone past the furthest you have ever been. Paged window of 7 gates (3 on phones) centred on the viewer, percentage-positioned.

**Fixtures** — `seedCommunity.ts` now parks a session run per Kanto trainer at a fixed depth, two of them dead, so the map has a field in local dev.

Decisions: fallen = died only (abandoning is not falling); best = deepest position across finished runs, gap counted in polls; paged window over scroll.

Verified: 1223 tests pass (117 files), `tsc --noEmit` clean, oxlint clean, dependency-cruiser clean, production build passes. Six Storybook states reviewed in Chrome (MidClimb, FirstClimb, ChasingYourBest, Summit, CrowdedGate, SoloClimb).

Still open from the original bean: other players' builds/configs and storage. Worth a follow-up.
