# ADR-167: Build space is one module

## Status

Accepted — 2026-10-01 (DVTD-e083). Builds on ADR-098 (the rung follows the
build) and ADR-122 (YAGNI's credit).

## Context

Room, cap and upkeep were answered by seventeen shallow exports across
`rules.model`, `build.model` and `run.model`, a private `settleUpkeep` in
`answer.model`, and a refusal in `runView.viewmodel`. Two of them disagreed:

- The shop screen refused an offer against `spaceDroppedTo` (the space the
  balance covered at the last close), while the `draft` action and the new-run
  install checked the top of the ladder. During a capped shop the screen said no
  and the server said yes.
- Two ladder readings rounded in opposite directions: `rungIndexFitting` up (the
  smallest rung a weight fits in) and `rungIndexForSpace` down (a legacy save's
  bought slot count).

## Decision 1: one module answers every build space question

`build/domain/buildSpace.model.ts` exports four things:

- `buildSpaceOf(holder)` — weight, rented space, free weight, YAGNI's credit,
  upkeep owed, the cap, room left under it, and overflow past it.
- `fitsBuildSpace(holder, slots)` — the one refusal rule; the draft action, the
  new-run install and the shop's offer refusal all call it.
- `settleUpkeep(build, balanceKb)` — what the close pays and the space it drops
  to when the balance falls short.
- `rungFitting(weight)` — the ladder lookup, for builds that are not a `Build`
  (another player's public build, fixtures).

A holder is `{ build, spaceDroppedTo? }`, so a `RunState` passes as itself and a
bare build passes as `{ build }`. The ladder data (`BUILD_SPACE_RUNGS`,
`BASE_SLOTS`) stays in `rules.model`.

## Decision 2: the cap binds the draft, so the screen's rule wins

The wiki states that a bill you cannot pay "caps the build": the run is held to
the space its balance covered. Drafting past that space only buys a config you
must sell back at a loss before the exit opens, and the screen already refused
it. The action now refuses it too.

## Decision 3: the ladder rounds up, once

A weight rents the smallest rung it fits in. The round-down reading served a
bought slot count that no live path stores any more; every caller passed a rung
weight, where both readings agree. It is deleted.

## Not decided here

The shop's exit lock while over the covered space is still enforced only by the
screen; the `finish-reward` action accepts it. Enforcing it in the reducer stalls
the ADR-161 balance simulation, whose policy never sells, so it waits for a
decision on how the simulation should shed weight.
