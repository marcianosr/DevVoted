---
# DVTD-t3lt
title: A finished run has a permalink at /runs/$runId
status: completed
type: feature
priority: normal
created_at: 2026-09-16T10:28:15Z
updated_at: 2026-09-16T10:54:55Z
parent: DVTD-0x5c
---

The live run has no id in its URL on purpose: `getTodaysRun()` resolves it from the session, and at most one session run is active per user. Finished runs are the opposite case (many, immutable, worth linking) so they get the id, under a distinct plural prefix.

`/runs/$runId` renders `RunOverView` read-only. The Dex Runs tab rows link here.

Authorization: `runId` is client-supplied, so the service must verify ownership against `getAuthenticatedUserId()`. Never accept a `userId` parameter.

The depcruise rule `routes-only-into-presentation` forbids a route importing `application/`, so no `beforeLoad` guard. Follow `profile.$userId.tsx`: the route reads `Route.useParams()` and passes `runId` to a presentation component.

- [x] `getRunRecapService` + server fn, ownership-checked
- [x] `RunRecap.component.tsx` renders RunOverView
- [x] Route `src/routes/_authed/runs.$runId.tsx`
- [x] Link the Dex Runs rows — split out to DVTD-vueu (needs a pressable Panel.Row)
- [x] Spec: another user's run is refused

## Summary of Changes

`/runs/$runId` renders a finished run read-only via `RunRecap` + `RunOverView`. Plural prefix on purpose: `/runs/` is the archive, `/run/` is the climb you are playing, and only the archive needs an id.

Authorization: `getRunRecapService` loads the run by id, then compares `run.user_id` against the session userId. A run belonging to someone else and a run that never existed are refused in the same words, so the archive is not enumerable. Specced both ways, including that a refused read never touches `loadRunState`.

No `beforeLoad` guard: the depcruise rule `routes-only-into-presentation` forbids a route importing `application/`, so the route reads `Route.useParams()` and hands `runId` to a presentation component, per `profile.$userId.tsx`.

The Dex link is NOT done and moved to DVTD-vueu: `Panel.Row` has no pressable mode, so making a run row openable is a kit change with its own affordance convention.
