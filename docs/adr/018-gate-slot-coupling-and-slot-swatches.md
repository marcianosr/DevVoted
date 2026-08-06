# ADR-018: Gate–slot coupling — every gate advance is bought with a slot

## Status

⚠ **Superseded by [ADR-019](019-depth-and-width-are-independent.md)** (2026-08-06,
one day after acceptance). The coupling below, the `heldAtGate` state, and
slot-keyed swatches are all gone; read 019 for what shipped. Kept for the
reasoning, since 019 is a direct answer to it.

Was: accepted (2026-08-06, Marciano). Added a second consequence to pipeline width
(ADR-008 Decision 2 — inline pointer there), flipped `VICTORY_GATE` per DVTD-g1p0,
and constrained the frozen-gate case in ADR-013 and ADR-014.

## Context

ADR-008 made slots free but coverage-gated: *breadth earns width*. Coverage was a
gate, never a currency. Width, however, bought nothing the player had to have —
a 3-slot build could ride skip-only configs to the summit, which ADR-017 priced
out (a 0/5 clear banks nothing) but did not actually prevent. Depth and breadth
were independent axes, and only one of them was mandatory.

Meanwhile `VICTORY_GATE` sat at 5 in code while the design had confirmed 12
(DVTD-g1p0, 2026-08-04). Its blocker — demands outgrowing the 5-poll window
around gate 8 — was resolved 2026-08-05 by `ESCALATION_CAP`.

Marciano's framing (2026-08-06): *"you will stay at the same gate if you don't
take up more slots, so players can't farm to gate 12."* Slot unlocks are also
re-themed as collectible gym-badge **swatches**, which gives the width ladder a
visible identity to chase rather than a utility button to press.

A first pass read this as "gate N requires slot N", which let the three starting
slots carry gates 1–3 and only walled the climb on clearing gate 3. Marciano
rejected that on sight (playtest, same day): *"even when I don't/can't claim the
slot the gate is increased. That should not happen. The gate only increases when
you claim."* Every advance — including the first — must be bought.

## Decision

1. **Every gate past the first is bought with a slot.**
   `slotsRequiredForGate(g) = g + BASE_SLOTS`: gate 0 runs on the starting
   width, gate 1 needs slot 4, and gate 11 needs all 14.
   > ⚠ Amended by the same-day amendment below: gates were first numbered from 1. In `closeWindow` a clear
   only advances the climb when the next gate already fits, otherwise
   `gatesCleared` freezes and the gate is replayed. The clear still pays, and
   because every downstream number keys off `gatesCleared`, demands, payout,
   coverage multiplier (ADR-013), and `dropCount` all stay flat across the replay
   — no farming ramp. Chosen over hard-failing the gate (punishes a clear the
   player earned) and over blocking the day (ADR-014's lock already owns the
   calendar).
2. **The freeze never regresses.** The implementation is a ternary, not
   `Math.min(gateNumber, slots - 1)`: snapshots written before this ADR can hold
   `gatesCleared >= slots`, and clamping would knock them backwards mid-run. No
   snapshot migration.
3. **The claim is what advances the gate.** A held clear leaves `clearedGate`
   one ahead of `gatesCleared`; `addSlot` lands that pending advance the moment
   the new width fits the next gate. This is the rule stated literally in the
   model, so the shop's unlock button is the act that moves the climb. Widening
   further in the same shop banks width for later gates rather than skipping
   ahead — one clear still yields one advance.
4. **Victory outranks the freeze.** The `gateNumber >= VICTORY_GATE` branch is
   evaluated on the uncapped gate number and records the summit uncapped, so
   clearing gate 12 on 14 slots wins. Reaching gate 12 at all requires slot 14,
   so the summit implies a fully widened pipeline — every swatch, and the top of
   the coverage ladder.
5. **`VICTORY_GATE` = 11** (was 5), closing the code half of DVTD-g1p0. It is now
   a *derived* number: `MAX_SLOTS - BASE_SLOTS`, asserted in the spec, and it
   names the summit *gate* while `GATE_COUNT` counts them. The victory *reward*
   and continue-past-victory stay open on that bean.
6. **`MAX_SLOTS` 12 → 14, and two non-gym swatches.** Twelve gates need eleven
   advances, but Kanto has only eight gym badges plus the Elite Four. Rather than
   shorten the run to gate 10 or leave the last advances unbought (both offered
   and rejected), the ladder gains the two Kanto landmarks that never had a gym:
   **Lavender** (slot 12) and **Seafoam** (slot 13), with the **Elite Four**
   moving to slot 14 so it stays the finale. Coverage rungs for slots 13–14 (325,
   415) extend the existing curve's growth and are **untuned** — flagged in
   `pipeline.model.ts`.
7. **A new state field `clearedGate`** records the gate a clear actually beat.
   It is not derivable from `gatesCleared` + `slots` once the freeze exists, it
   is what `addSlot` reads to know an advance is pending, and without it the
   reward screen would announce "Gate 2 cleared!" for a gate-3 clear. Optional
   on the type; readers fall back to `gatesCleared` for old snapshots.
8. **Slot unlocks are swatches, and they persist.** Every slot that opens a gate
   (3–14) carries a swatch colored from its home Kanto location. Slot 3 is
   **Pallet**: free, granted when the run starts, and the reason gate 1 needs no
   purchase — it keeps "every gate is opened by a swatch" true without exception; slot 14 is the Elite
   Four and wears the legendary gradient because indigo, its palette match, is
   the app background. Names and themes
   live in `modules/run/pipeline/swatch.model.ts`; the colors themselves stay in
   `app.css` under `[data-swatch-theme]`, never duplicated in TypeScript.
   Unlocking a slot writes the swatch id to `users.owned_swatch_ids` inside the
   dispatch transaction, guarded so a re-unlock on a later run is a no-op —
   mirroring the shipped `owned_border_ids` collectible rather than inventing a
   join table. Coverage thresholds are **not** copied into the swatch model;
   `pipeline.model.ts` remains the live-tuned source of truth (ADR-008). Because
   one swatch opens one gate, the roster length is an invariant:
   `ALL_SWATCHES.length === VICTORY_GATE`.

## Consequences

- **Runs get longer and breadth becomes strictly mandatory.** A flawless summit
  is ≥12 calendar days, plus a day for every gate replayed waiting on coverage —
  and since even gate 2 must be bought, the first replay can happen on day 2.
  Coverage pacing against the ladder is the balance risk to watch; tune in
  `pipeline.model.ts`, not here.
- **Death banks less.** `storageCreditRate("dead", g)` divides by
  `VICTORY_GATE`, so dying at gate 5 drops from 100% to 42% of leftovers. This
  follows the documented "proportional to the summit" intent and is a real
  balance change, called out in the changelog.
- **Frozen replays re-roll same-depth drafts** each lap, at the usual reroll
  pricing. Accepted: the replay is meant to be a shopping-and-coverage lap.
- The end-of-run ladder needs no change: dying while replaying gate 3 marks gate
  3 failed and the rest unreached, which is what `deriveGateLadder` already does.
- The reward report needs a **third headline state** (DVTD-nk0g), since a held
  clear would otherwise render identically to an advance.
- The legacy prototype engine (`src/domains/runs/prototype/sessionRun.ts`) keeps
  its own `VICTORY_GATE = 5`; it is parked and diverges knowingly (as in ADR-017).

## Amendment: gates count from 0 (2026-08-06, same day)

Marciano, on seeing the shipped numbering: *"I think everything should start at
gate 0, not gate 1 — you work towards gate 1 starting from 0."*

- **Gate numbers are 0-based.** A run opens on **gate 0** and the summit is
  **gate 11**; `slotsRequiredForGate(g) = g + BASE_SLOTS` and
  `gateOpenedBySlot(s) = s - BASE_SLOTS`, so Pallet (slot 3) opens gate 0 and the
  Elite Four (slot 14) opens gate 11. Decision 1's formula above is superseded by
  this one; the arithmetic is unchanged, only the naming moved.
- **`VICTORY_GATE` = 11** is the summit's *number*; **`GATE_COUNT` = 12** is how
  many gates a run holds. `gatesCleared` stays a count, so it also happens to be
  the number of the gate being played (bank none, play gate 0). That identity is
  what lets the HUD read one number: `gate 0 / 11`.
- **`storageCreditRate` divides by `GATE_COUNT`**, not the summit's number: it
  weighs a count against a count.
- **A new `heldAtGate` flag on `RunState`** replaces the old
  `clearedGate > gatesCleared` inference. Under 0-based numbering those two are
  *equal* while held, so the hold had to become explicit. `addSlot` reads the flag
  to land a pending advance, and the viewmodel passes it straight through.
- `deriveGateLadder` and `gateLadderRungs` both take the **final gate's number**
  and yield gates 0…final inclusive, so the two helpers agree.

Consequence worth stating: every player-facing gate string shifted down by one.
The first gate is "gate 0", a first-gate death reads "Gate 0 — pipeline broke
here", and the reward report's held state reads "Gate 0 cleared — still gate 0".
