# ADR-165: A run screen asks the route map where it goes

## Status

Accepted — 2026-10-01 (DVTD-tgzu, DVTD-rreq, DVTD-teim). Extends the
CLAUDE.md rule that `useRunCommit` owns what a run action writes and stales.

## Context

`runRoutes.viewmodel` already decided which screens each run status allows
(the route sync) and where the hub and the community board resume. Eight Tier-2
run screens then named their own next screen again: prep redeclared three status
literals and a back ternary, the gate compared `view.status` to choose between
review and shop, and every screen spelled `"/run/..."` by hand. A new phase or a
moved screen had to be changed in the sync and again in every press, and a press
could send the player to a screen the sync would bounce.

The LGTM approval ran on its own bare mutation beside the run's dispatch. It
was not counted in `busy`, its refusal was dropped, and its result was only
written to the run cache when the player pressed Next. Three call sites also
unwrapped the response envelope of a mutation by hand.

## Decision 1: the route map owns every forward and back press

`runRoutes.viewmodel` exports the phase graph as functions of the run view:
`nextFrom(screen, view)` for the forward press of the build, prep, gate, shop
and run-over screens, `prepBackOf(view)` and `REVIEW_BACK` for the back presses
with their labels, and `prepDepartureOf(view)` for the action prep must dispatch
before the poll opens. Screens import `RUN_ROUTES` and `COMMUNITY_ROUTE` for
plain links and never write a run path. `useRunNavigation` is the one navigate
for run links and ignores a `null` target, which is how "stay here" is said.

A forward press after an action reads the view the action returned, not the one
on screen, so the target follows the engine.

## Decision 2: every run request goes through one dispatch

`useRunActions` has one dispatch mutation that sends either a run action or the
crowd pick. `sendCrowdPickWith` hands the staged result to the poll screen like
`sendWith` does for an answer, so `busy` covers both and a refusal reaches the
caller, which states it on the LGTM press. The poll screen commits a staged
reveal when it unmounts, so leaving before Next still writes the run.
`useRunCommit` returns a stable `commit` so that unmount effect runs once.

## Decision 3: a mutation reads its refusal through `useApiMutation`

`useApiMutation` wraps `useMutation` and adds `errorMessage`, worded by the same
`apiErrorMessageOf` that `useApiQuery` uses. A handled refusal and a thrown
error read the same way on a query and on a press.

## Consequences

- A new run screen asks `nextFrom` for its forward press; adding a phase is an
  edit to one file and its spec, which proves each press lands where the sync
  leaves it alone.
- The review's back press still says "Back to the gate" while a missed gate is
  replayed, and the sync then forwards it to the shop. That is unchanged
  behaviour, now visible in one place.
