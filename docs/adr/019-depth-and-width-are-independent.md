# ADR-019: Depth and width are independent; swatches are gate badges

## Status

Accepted (2026-08-06, Marciano). **Supersedes [ADR-018](018-gate-slot-coupling-and-slot-swatches.md)** (same day).

## Context

ADR-018 made gate N require slot N, so unlocking a slot was what advanced the
climb. Marciano rejected it a day later: clearing a gate is a *checks* test and
coverage buys *width*, so welding them made the gate number redundant (at the
frontier it was always `slots - 3`) and turned a clear with no coverage into an
enforced replay of the same gate — the farming ADR-017 §2 already prices out.

## Decision

1. **Every clear advances one gate.** Depth is paid for in checks, nothing else.
   A run can sit at gate 5 on its starting three slots. `heldAtGate`,
   `slotsRequiredForGate` and `gateFitsPipeline` are deleted.
2. **Slots buy width only.** The coverage ladder is unchanged and its length is
   now free to differ from the gate count (`MAX_SLOTS` 14, 13 gates).
3. **Swatches are gate badges,** keyed by gate and awarded server-side on the
   clear — you beat the leader, you get the badge; backpack space earns nothing.
   `VICTORY_GATE` becomes a content decision (12, so 13 gates and 13 badges) and
   the roster gains **Elite** (gate 11) then **Champion** (gate 12).
4. **The gate is not the wall; dying is.** Demands escalate with depth, so a
   pipeline too narrow to meet them fails rather than stalling.

Rejected: keeping the coupling. It prices depth in a currency the checks already
charge for, and its stall state ("cleared, still gate 3") reads as a bug.

## Consequences

- `storageCreditRate` and the reward multiplier cap divide by 13, not 12.
- **Open risk:** `ESCALATION_CAP = 3` means an un-upgraded Unit Tests never
  demands more than 4 of 5 at any depth, so a *narrow* build owes fewer checks
  and can coast to the summit. Deliberately shipped as-is so the wall can be
  felt before it is tuned — tracked in DVTD-ziss.
- 13 gates against 12 Kanto colours (indigo being the app background) is why the
  summit pair are drawn apart: Elite keeps indigo with a rim, the Champion alone
  wears the gradient.
