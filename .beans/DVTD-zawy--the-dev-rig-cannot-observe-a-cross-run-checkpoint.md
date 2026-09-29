---
# DVTD-zawy
title: The dev rig cannot observe a cross-run checkpoint
status: completed
type: bug
priority: normal
created_at: 2026-09-27T19:23:49Z
updated_at: 2026-09-27T19:29:54Z
---

**What:** proto-run restarts at gate 0 even after a git tag is planted, so the checkpoint's whole payoff is unobservable in the dev rig.

**Why:** The rig is a single-run simulation over a local reducer; the tag is a cross-run effect the server owns, and two specs mock the seams away so nothing catches it either.

## Done when

- [x] A tag planted in the rig carries across restart and opens the next run at that gate
- [x] A rescued run in the rig opens on the real 32 KB per gate stipend, not the rig's flat 256 KB
- [x] Restarting again without planting drops back to gate 0, so the tag burns
- [x] Your own chip on the rig's climb map reads as rescued
- [x] A spec proves the planted gate reaches the user row
- [x] A spec proves a stored pinned gate produces a rescued run at the right gate, stipend and coverage

## Notes

The ADR-036 loop is wired end to end in the real stack. Nothing about the feature is broken; the rig simply cannot see it, for three independent reasons: createRun is called with two arguments so the start gate is always 0, restart remounts through a key so the planted gate dies with the component, and the storage override lands after the spread and would clobber the stipend anyway.

The coverage holes are the reason this stayed invisible. The domain has eight honest reducer tests. The two seams either side of it are both mocked flat: the service spec pins the consume to 0 for every test, and the repository spec never touches the column.

Found while playtesting the tag on the rig.

## Summary of Changes

`src/routes/proto-run.tsx`: `RunGame` takes a `startAtGate` prop and passes it to `createRun` as the third argument; the flat `PROTO_START_KB` override now applies only to a fresh run, so a rescue keeps the real stipend. `onNewRun` reports `state.pinPlantedAtGate ?? 0`, and `RouteComponent` holds the rescued gate beside the seed so both change in one update. `protoClimbFor` and `simulateCommunityScreen` take `startedAtGate`, so your own chip reads as rescued instead of being hardcoded to 0.

`run.repository.spec.ts`: two tests in `applyActionToRun`. The positive asserts `usersTable` is updated with `{ pinned_gate: 4 }`; the negative asserts a `rebuild-draft` writes the run state row but leaves `usersTable` alone, so it cannot pass by hitting the unchanged-state early return.

`run.service.spec.ts`: a stored gate of 7 produces `gatesCleared`, `startedAtGate`, the `32 KB x 7` stipend and coverage 0, and a run with no tag still consumes and opens at gate 0. Uses `mockResolvedValueOnce` because `vi.clearAllMocks()` clears calls but not implementations, so a plain `mockResolvedValue` would leak forward and turn later tests into rescues.

Both specs were checked against a deliberately broken source and each failed, so neither passes vacuously.

Verified: 225 files / 4389 tests pass, lint clean (one pre-existing unrelated warning in `Screen.stories.tsx`), `npm run build` and `tsc --noEmit` clean.

The burn falls out for free: a fresh `createRun` leaves `pinPlantedAtGate` undefined, so the restart after a rescued run reports 0. The rig passes the gate on a win as well as a death, matching today's server behaviour, which means it now reproduces DVTD-ecnx's silent burn rather than hiding it.
