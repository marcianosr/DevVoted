# ADR-160: The gate close is recorded once

## Status

Accepted — 2026-09-30 (Marciano). Amends
[ADR-076](076-the-closing-band-decides-what-it-costs.md) (the debrief's clamp
is deleted), [ADR-094](094-the-bands-are-cut-in-answers-and-widen-with-the-climb.md)
§6 (the screen reads the record, not `GatePayout`) and
[ADR-147](147-the-hub-shows-the-run-so-far.md) (a recorded close carries its
ruling). Built the same day.

## Context

The reducer decided every gate once, in `closeWindow`, and wrote three fields:
gate, band, cleared. Four screens then worked the verdict out again from what
they had. The debrief clamped its bar into the band the verdict named and then
read the band back off the clamped bar. The hub banded the coming gate on the
unaudited ladder, so it could name a different band than the gate screen for the
same state. The run-over screen recomputed upkeep from a weight that counted the
vendor-locked config, so it showed a bill the reducer never charged. And the
band classifier itself lived in the design kit, where fourteen application
files reached up for it.

## Decision

1. **The record states everything the gate decided.** `LastClose` carries the
   closing (`cleared` / `held` / `fatal`), the hold reason, the held coverage in
   percent, the audited ladder at the close and the day's correct count, beside
   the gate, band and cleared flag it already had. `closeWindow` writes it on
   every exit, and the band it records is the one the ruling used, so a flawless
   gate under the floor records SHAKY, as the player is told.
2. **Screens read the record.** `RunView.lastClose` is the close as a screen may
   read it (`gateCloseViewOf`), filling a snapshot written before the record
   grew. The debrief's bar is the recorded ladder and the recorded meter, never
   nudged into a band. Its outcome band is derived from the closing: a fatal
   close reads DANGER, a hold reads SHAKY, a clear reads the recorded band.
3. **One classifier, in the domain.** `bandAtLadder(held, ladder)` in
   `gate.model.ts` cuts percent into a band; `bandAtClose` calls it. The
   coverage bar takes its `band` as a prop and draws it without classifying, so
   the kit holds no copy of the rule.
4. **The run-over screen states what the run view settled.** The free weight,
   the empty-slot credit and the upkeep a gate costs come from `buildSpace`,
   which the domain already computed, vendor lock included.

## Consequences

- `GatePayout` loses `clearedGateLadder`, `clearedCoverageHeld` and `heldBy`;
  `GateOutcomeView` no longer takes a verdict, because the record is one.
- A run with no close draws no debrief. The config-story rig closes a full
  window before it draws one, which made two stories admit they were drawing a
  debrief for a gate that never closed.
- Application files still import kit *copy* in fifteen places, so the
  dependency-cruiser rule that would forbid application → kit values waits for
  that clean-up (DVTD follow-up).
