# ADR-021: A run dies at the gate that empties its build

## Status

Accepted (2026-08-07, Marciano). **Supersedes the death rule of
[ADR-006](006-session-run-mechanics.md) Decision 6 and
[ADR-014](014-daily-gate-lock.md) §3.**

## Context

ADR-006 §6 set the loss model: fail a gate, peel `dropCount` configs, replay the
gate. A quota larger than the build stripped it bare instead of killing, and
death waited for the *next* failed gate. ADR-014 §3 reaffirmed that: "the run
dies only when a bare build fails a gate".

ADR-017 §3 then made a bare pipeline unable to clear anything (no baseline
check, so an empty checklist is failure rather than a vacuous pass). That turned
bareness into a decided death that still had to be played out: five more polls
that cannot possibly clear, a second peel of nothing, then the verdict. The
answering screen's stake line (`StakeOnFailure`) had already been written to the
honest rule, showing "a fail peels all 3, run over" in cinnabar whenever the
quota met the build, so the UI promised a death the reducer did not deliver.
Marciano reported that mismatch as a bug (2026-08-07): hitting zero configs
should be game over.

## Decision

1. **A failed gate whose peel quota meets or exceeds the installed configs ends
   the run** (`quota >= installed` in `closeWindow`), with no strip screen and no
   partial peel. The build is left as it died, which is what the run-over summary
   reads.
2. **The peel is therefore always survivable.** The quota is strictly smaller
   than the build whenever the strip screen opens, so at least one config always
   survives it, and the screen only appears when the player has a choice to make.
3. **Nothing outside a failed gate can empty the pipeline.** The shop refuses to
   deinstall or drop the last installed config (`holdsLastConfig`), and the
   Deinstall button on a one-config load-out is disabled with the reason.

   > ⚠ Generalized by ADR-027: `holdsLastConfig` became `atMinimumWidth` — the
   > shop and prep doorstep refuse any removal at or under the coming gate's
   > width demand (`minConfigsForGate`), not just the last config.
4. **`isBare` stays** as gate.model's clear rule (ADR-017) and as the reducer's
   fallback for runs snapshotted before this ADR, which can still resume with an
   empty pipeline.

**Rejected: let the player peel to zero, then die on the strip screen.** The
peel is a choice between configs; when the quota takes everything there is
nothing to choose, so the clicks only delay a verdict already reached.

**Rejected: kill a run that sells its last config.** Death is the gate's job. A
shop button that ends a run is a trap, not a stake, and no failed gate has
charged for it.

## Consequences

- Fragility arrives one gate earlier and reads honestly. From **gate 4**
  (`dropCount` 3) a three-config build is one bad window from dead, which is
  exactly what the answering screen has been saying all along.
- A run can no longer sit in a state whose outcome is settled but unplayed. The
  zombie window is gone, and with it the only path to a second peel that peels
  nothing.
- Banked storage is unchanged. The bare replay never cleared a gate, so
  `gatesCleared` at death (and therefore `storageCreditRate`) is the same number
  it would have been a window later.
- Width stays the run's hit-point pool. What changed is where the last hit point
  sits: on the last config, not one gate past it.
- No migration and no new status: `"dead"` already routes to `/run/over`.
