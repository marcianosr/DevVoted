# ADR-057: Gate 0 is the calibration gate

## Status

Accepted (2026-09-04, Marciano, DVTD-ej8m).
Amends [ADR-052](052-the-run-opens-on-a-dealt-hand.md) Decision 2 (the recommended trio
is no longer installed) and reaffirms its Decision 3. Answers open question 3 of
[ADR-034](034-the-gate-is-a-ci-run.md). Does not revive the mandatory config
[ADR-017](017-no-baseline-check.md) deleted.

## Context

A first run opened with three configs already installed, and gate 0 could end it: a lone
one-slot build missing the 3% demand died on the spot, because the peel quota equalled
the build. Both work against the same moment. The opening is where a player learns what a
config is, and the game was either deciding for them or punishing them for deciding
wrong.

## Decision 1: one config is the floor, and nothing is preselected

The build opens empty. One config is the minimum to play, which is ADR-052 Decision 3
unchanged; what goes is the preselection that made three the default.
`withRecommendedBuild` is deleted rather than left unused, so preselection cannot be
quietly rewired.

This is a floor, not a mandatory config. There is no locked, fixed or undroppable config
and none is to be added: ADR-017 deleted `fixed: [CONFIGS.unitTests]` and the regression
test `"unslots any config while configuring — Unit Tests included"` still holds.

## Decision 2: the recommendation is a marker, and there are two of it

`RECOMMENDED_SIZE` drops 3 to 2. `recommendedPicks` survives unchanged but now feeds a
badge instead of the reducer, on the terminal theme's deal rows and the production
bench's chips.

The marker is recomputed in `toRunView`, never persisted. `recommendedPicks` is
deterministic in `(hand, slotBudget)` and both inputs already survive a snapshot, so a
reload reproduces it exactly. Persisting would need either a required field that breaks
every in-flight run's hydration, or an optional one whose only sane fallback is
recomputing.

## Decision 3: a Pallet miss peels nothing

`GATE_FAIL_PEEL_SHARE[0]` is `0`. The share table stays the whole rule rather than a
branch below it, because `gatedex.model.ts` reads `failPeelShareFor` directly, bypassing
the quota — any lower branch would leave the Dex publishing a 20% peel the engine never
takes. Audits still compose on top (`failPeelShareFor + auditExtraPeelShare`), so a strip
audit reaching gate 0 would peel again, correctly.

Gate 0 keeps its 3% demand. A calibration gate should still measure you; the free miss is
what removes the punishment.

Death at gate 0 is now impossible except for a bare build. `isPeelFatal` is
`quota >= occupied`, so `0 >= 0` still ends a bare run — narrowing it to `>` would strand
a run that can never pass.

## Decision 4: a waived miss lands on the answers

A miss with nothing to peel still enters `awaiting-strip`, but the route order flips to
review first. The player reads back the five answers they just missed, then takes
Review's existing press to the shop; they never see a repair screen with an empty list.

Skipping to the shop was considered and rejected: `/run/review` is linked only from the
strip and reward screens, and the reward screen is excluded for a redo, so skipping would
leave the failed gate's answers unreachable at the one gate where reading them is the
point.

`syncTarget` only moves a player whose current screen is not in the allowed list, so
somebody on the strip screen who has just paid their last slot stays there and presses
their own button.

## Pinned numbers

| Rule | Value |
| --- | --- |
| `HAND_SIZE` | 5 |
| `RECOMMENDED_SIZE` | 2, advisory |
| Start floor / ceiling | 1 config / `BASE_SLOTS` |
| Gate 0 peel share | 0 |
| Gate 0 coverage demand | 3% |
| Gate 1+ peel share | unchanged (0.2 to 0.35) |

## Consequences

- Repeated gate-0 misses cost only the day's polls. ADR-037's open question, whether
  repeated misses at the same gate should deepen the peel, is where this would bite.
- `status: "awaiting-strip"` and the route `/run/strip` are now sometimes named after a
  debt that does not exist. Not renamed: `RunStatus` is persisted in `run_states.state`
  for in-flight runs, and the route is in the generated tree.
- `gateStake.missIsFree` is derived from the quota rather than the share, so it stays
  audit-aware and build-aware, and excludes the bare build where a zero quota means
  death.
- `agentsMd` is 8 slots against `BASE_SLOTS` 4, so it is unpickable at run start and
  cannot be recommended. Pre-existing, and more visible now that nothing arrives
  preselected to soften it.
- A tagged run (ADR-036) resumes at a pinned gate and never sees gate 0, so "the first
  gate is free" is a property of gate 0, not of a run's first gate.
- The peel debt is quoted in slots on the repair screen and as a config range in the
  forecasts. `GateStakeReceipt` and `GateRewardReport` were labelling slots as configs;
  both now match `peelConfigsOnFailure` and `plural(_, "slot")` respectively.
