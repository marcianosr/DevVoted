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
- **The roster's spine is the palette, not the map** (2026-08-07). Every gate
  spends one Kanto colour exactly once, so the count is "12 colours plus the
  gradient" and the two non-gym landmarks (Lavender, Seafoam) exist because
  their colours did, not because Kanto owed them a stop. A fourteenth gate would
  therefore mean inventing a thirteenth colour, off-palette from the Warp theme
  the set is drawn from; and once a location can justify a colour rather than
  the reverse, Mt. Moon, Victory Road, the Safari Zone and Silph Co. all have an
  equal claim and there is no principled place to stop. Victory Road is the one
  with a real narrative gap to fill (the 8th badge currently hands straight to
  the Elite Four); it is name-checked in flavour rather than given a swatch.
- **Landmarks sit where Kanto walks them** (2026-08-07). Lavender and Seafoam
  moved from gates 9–10 to 4 and 8, leaving the eight badges in strict
  trainer-card order. Two reasons: mid-game stops were sitting one gate from the
  Elite Four, and the palette's two palest colours were on the deepest gates, so
  the run visibly cooled off where it should have been closing in. The summit
  approach now reads cinnabar → viridian → indigo. Safe to reorder because
  `users.owned_swatch_ids` persists `swatch-${theme}` ids, never gate numbers;
  only a run's in-flight "earned so far" set, derived from `gatesCleared`,
  reshuffles.
