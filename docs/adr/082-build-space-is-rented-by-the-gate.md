# ADR-082: Build space is rented by the gate, and the shop door holds you to it

## Status

Accepted, 2026-09-14 (Marciano, DVTD-uhub). Builds
[ADR-074](074-weight-is-what-the-build-costs-to-run.md) and amends two of its
four decisions. Retires ADR-046
and ADR-049, whose code is now gone.

## Context

ADR-074 decided that weight bills KB at every gate close, and left three things
open that only became answerable once the rules ran: whether the bill is read off
the build's weight or off something the player picks, whether anything stops a
build outgrowing what it pays for, and what happens when the bill cannot be paid.

Until now none of it ran. `SLOT_PRICES_KB` and `STORAGE_PLANS` still drove the
shop, the gate and `run.validation.ts`, while the kanto weight surface existed
only in fixtures and stories.

## Decision

1. **The rung you hold is the bill, used or not.** Build space is a rung on
   ADR-074's ladder (`4/0, 6/16, 8/32, 12/64, 16/128, 24/256, 32/512`), and
   holding it costs its KB at every gate close whatever the build weighs. You
   pay for reserved room.

   ADR-074 read as though the bill followed the weight in use. It cannot: a bill
   that only charges for room you have filled makes the empty half of a rung
   free, so there is never a reason to step back down, and the decision to widen
   stops being a decision at all.

2. **The player picks the rung, up or down, at no counter price.** There is no
   purchase and no refund, only a standing bill that changes. This replaces the
   storage plan outright — ADR-074 Decision 3 kept a subscription selling free
   weight beside the ladder, which is two ways to buy the same thing.

3. **The rung is a hard cap, and the shop door holds you to it.** A build heavier
   than the space it holds cannot leave the shop. This reverses ADR-074
   Decision 2, which made capacity soft and retired the exit lock.

   The lock is a different animal from ADR-046's. That one fired because the game
   had not sold you enough room; this one can only fire because you chose a
   cheaper rung than your build fits in, and it always has two ways out — drop
   weight, or step back up and pay for it.

4. **An unpayable bill drops the rung, and the door does the rest.** The run
   falls to the widest rung its balance covers. If the build no longer fits, it
   arrives in the shop over its space and cannot leave until it does.

   This replaces ADR-074 Decision 4's peel. A peel cannot settle a bill charged
   for reserved room — dropping configs does not make the room cheaper — and the
   remedy it wanted already exists in the door. Never fatal: rung 4 is free.

5. **The picker opens at gate 1** (amended 2026-09-22; it opened at gate 2 until
   then). The first shop a run reaches is the one that stocks Boulder, and it
   rents. Pallet stays the same for everyone — it is the calibration gate
   (ADR-057) and the run has earned nothing to spend there anyway — but making
   the *first* shop a shop with nothing to decide was a gate of dead time, not a
   legible opening. The ladder is the shop's second lever beside the registry;
   holding it back a further gate only delayed the choice it exists to pose.
   `BUILD_SPACE_FROM_GATE` owns the number and every sentence naming the gate
   derives from it.

   The *picker* is what waits, not the panel: the shop draws the ladder and its
   prices from the first shop on, locked, with a popover naming the gate that
   opens it. Withholding the panel outright taught a new player that build space
   was not a mechanic — they met `4 of 4 weight · 0 free` as a wall, and the one
   sentence explaining the ladder sat behind them on the new-run screen. The
   locked arm still has a case to draw at gate 1: `gatesCleared` advances only on
   a clear, so a held Pallet shops with the ladder shut.

## Consequences

**`Build.slots` changes meaning, and nothing else has to.** It stops counting
slots bought and starts naming the space held, which is a rung weight. Because
rung weights are unique the held rung is recoverable from it, so `RunState`
carries no new field — `slotsBought` is deleted and nothing replaces it.
`occupiedSlots`, `freeSlots`, `hasRoomFor`, `overflowSlots` and `isOverCapacity`
are untouched; the shop's exit lock already read `overflowSlots` and needed only
new wording.

**One surface states the bill, and it is the one that sells it.** The Build panel
used to badge its own upkeep, derived from the build's *weight*, which is the rule
this ADR replaced — it read 16 KB a gate beside a build space panel reading 32.
The Build panel now states room only ("5 configs · 7 of 8 weight · 1 free") and
the build space panel owns the bill. Two panels deriving one number from two
inputs is how they disagree.

**The weight track stopped drawing a ladder it no longer describes.** Its upkeep
ticks marked where a *weight* crossed a billing threshold. Under this ADR weight
crosses nothing — the rung is bought, and it is a hard cap the build cannot pass —
so the ticks, their labels, the "1 to 32 KB" caption and the "without it, 16 KB a
gate" hover were all claiming things that are no longer true. `WeightTrack` now
takes the space held and draws the build against it, with a dashed remainder for
rented room still empty. `upkeepAt` and `freeWeightOf` retire with the ticks;
`upkeepLabelOf` moves to `BuildSpace`, next to the bill it labels.

**The storage cap is gone for the third time.** `STORAGE_PLANS`, `storageCapFor`,
`cappedStorage` and `revealsPlanTier` are deleted, and `addStorage` no longer
clamps. This also deletes DVTD-wli9 — the top two plan tiers were unusable, and
there are no tiers.

**A saved run can hold a space that is not a rung.** Runs persisted under the
slot ladder carry arbitrary `build.slots`, so `upkeepForSpace` resolves the
highest rung at or below the space rather than requiring an exact match. That
lookup is load-bearing for old saves, not defensive padding. `RunState` is a JSON
blob, so no migration is needed.

**The new-run screen stops selling room.** ADR-049's archive-funded start slots
have no ladder to buy from, so `startSlot.model.ts` goes and every run opens on
the free four. The archive keeps its balance and loses its only in-run sink,
which ADR-074 already flagged as open and this does not answer.

**The legacy `/run` shop keeps working and gains nothing.** Its slot and
storage-plan sections are stripped; the picker is kanto-only. Its exit lock
survives with wording that names a remedy that still exists.

**The curve is still hand-set.** These are ADR-074's numbers, applied rather than
simulated. DVTD-8gns still owns the real shape, and the rung prices and
`KB_PER_PROVEN_SLOT` remain tuned against each other.
