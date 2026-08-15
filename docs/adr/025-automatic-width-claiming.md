# ADR-025: Width claims itself automatically

## Status

Accepted (2026-08-09, Marciano). **Amends [ADR-008](008-reward-shop-multibuy-coverage-gated-slots.md) Decision 2** (the coverage-gated ladder itself is unchanged — only how a slot is claimed). **The ladder is replaced by [ADR-034](034-the-gate-is-a-ci-run.md)** (2026-08-15): slots are granted by gate clears; the no-button auto-claim survives, keyed to the clear.

## Context

Since ADR-008, a slot was free but required the player to press **Unlock slot**
in the shop once its coverage rung was met — a locked row read "Opens at 8%
coverage", filled its bar, then waited for a click. That click had no cost and
nothing to lose by delaying (ADR-008 already made coverage a gate, not a
currency), so it never traded off against anything else in the shop; it was
ceremony. Marciano asked for the slot to just open the moment it's earned.

## Decision

1. **Width claims itself the instant coverage affords it**, wherever that
   happens — mid-answer, not only while the shop happens to be open. The
   `add-slot` action, `RunState.canAddSlot`-driven UI, and every `onAddSlot`
   callback are deleted, not kept dormant.
2. **The shop acknowledges what changed since the last visit.** A slot (or
   slots) auto-widened since the player last saw the shop renders as a
   one-time green "Unlocked Nth slot" row, in the same spot the locked
   progress row occupies — `RunState.justUnlockedSlots`, reset when the shop
   is left (`finish-reward`), not when it opens, so it survives long enough to
   be seen there.
3. **The coverage ladder itself is untouched.** `SLOT_COVERAGE_GATE`,
   `coverageToAddSlot`, `canAddSlot`, and `MAX_SLOTS` (`pipeline.model.ts`)
   still own the thresholds; this ADR only changes who/what crosses them.

Rejected: keeping a manual claim step "for feel." A press that never competes
against another choice isn't a decision — it's friction between the player and
a number the game has already decided to give them.

## Consequences

- A single large coverage jump (a bulk coverage-gain effect, a banked lead) can
  cross several rungs in one answer; `justUnlockedSlots` carries every slot
  claimed that way, and the shop's acknowledgment names all of them.
- The reward/gate-report's slot-progress line (`nextSlotProgress`, distinct
  from the shop's claimable row) already only ever reported the rung — that
  surface is unaffected.
- Anti-cheat wire schema (`schemas.validation.ts`) drops the `add-slot` action
  shape; the server never accepted a client-declared slot count, so no new
  surface opens.
