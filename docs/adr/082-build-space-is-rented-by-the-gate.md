# ADR-082: Build space is rented by the gate, and the shop door holds you to it

## Status

Accepted, 2026-09-14 (Marciano, DVTD-uhub). Builds
[ADR-074](074-weight-is-what-the-build-costs-to-run.md) and amends two of its
four decisions. Retires ADR-046
and ADR-049, whose code is now gone.

## Context

ADR-074 decided that weight bills KB at every gate close, and left three things
open: whether the bill is read off the build's weight or off something the player
picks, whether anything stops a build outgrowing what it pays for, and what
happens when the bill cannot be paid.

None of it ran yet. `SLOT_PRICES_KB` and `STORAGE_PLANS` still drove the shop,
the gate and `run.validation.ts`, while the kanto weight surface existed only in
fixtures and stories.

## Decision

1. **The rung you hold is the bill, used or not.** Holding a rung on ADR-074's
   ladder (`4/0, 6/16, 8/32, 12/64, 16/128, 24/256, 32/512`) cost its KB at every
   gate close whatever the build weighed. Superseded by
   [ADR-098](098-build-space-scales-with-the-build.md).

2. **The player picks the rung, up or down, at no counter price.** A standing
   bill that changes, replacing the storage plan. Superseded by
   [ADR-098](098-build-space-scales-with-the-build.md).

3. **The rung is a hard cap, and the shop door holds you to it.** A build heavier
   than its space cannot leave the shop, reversing ADR-074 Decision 2. Superseded
   by [ADR-098](098-build-space-scales-with-the-build.md).

4. **An unpayable bill drops the rung, and the door does the rest.** The run
   falls to the widest rung its balance covers. If the build no longer fits, it
   arrives in the shop over its space and cannot leave until it does.

   This replaces ADR-074 Decision 4's peel. Dropping configs does not make
   reserved room cheaper, so a peel cannot settle the bill, and the remedy it
   wanted already exists in the door. Never fatal: rung 4 is free.

5. **The picker opens at gate 1** (amended 2026-09-22; it opened at gate 2 until
   then). The ladder was drawn, locked, from the first shop on, with
   `BUILD_SPACE_FROM_GATE` owning the number. Superseded by
   [ADR-098](098-build-space-scales-with-the-build.md).

## Consequences

**`Build.slots` changes meaning, and nothing else has to.** It names the space
held, a rung weight, instead of slots bought. Rung weights are unique, so the
held rung is recoverable from it: `slotsBought` is deleted and `RunState` carries
no new field. `occupiedSlots`, `freeSlots`, `hasRoomFor`, `overflowSlots` and
`isOverCapacity` are untouched; the shop's exit lock already read
`overflowSlots` and needed only new wording.

**One surface states the bill, and it is the one that sells it.** The Build panel
used to badge its own upkeep from the build's *weight*, the rule this ADR
replaced, so it read 16 KB a gate beside a build space panel reading 32. The
Build panel now states room only ("5 configs · 7 of 8 weight · 1 free") and the
build space panel owns the bill. Two panels deriving one number from two inputs
is how they disagree.

**The weight track stopped drawing a ladder it no longer describes.** Its upkeep
ticks marked where a weight crossed a billing threshold. Weight now crosses
nothing, so the ticks, their labels, the "1 to 32 KB" caption and the "without
it, 16 KB a gate" hover were all false. `WeightTrack` now takes the space held
and draws the build against it, with a dashed remainder for rented room still
empty. `upkeepAt` and `freeWeightOf` retire with the ticks; `upkeepLabelOf`
moves to `BuildSpace`, next to the bill it labels.

**The storage cap is gone for the third time.** `STORAGE_PLANS`, `storageCapFor`,
`cappedStorage` and `revealsPlanTier` are deleted, and `addStorage` no longer
clamps. This also deletes DVTD-wli9: the top two plan tiers were unusable, and
there are no tiers.

**A saved run can hold a space that is not a rung.** Runs persisted under the
slot ladder carry arbitrary `build.slots`, so `upkeepForSpace` resolves the
highest rung at or below the space. That lookup is load-bearing for old saves.
`RunState` is a JSON blob, so no migration is needed.

**The new-run screen stops selling room.** ADR-049's archive-funded start slots
have no ladder to buy from, so `startSlot.model.ts` goes and every run opens on
the free four. The archive loses its only in-run sink, which ADR-074 already
flagged as open and this does not answer.

**The legacy `/run` shop keeps working and gains nothing.** Its slot and
storage-plan sections are stripped; the picker is kanto-only. Its exit lock
survives with wording that names a remedy that still exists.

**The curve is still hand-set.** These are ADR-074's numbers, applied rather than
simulated. DVTD-8gns still owns the real shape, and the rung prices and
`KB_PER_PROVEN_SLOT` remain tuned against each other.
