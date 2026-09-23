# ADR-098: Build space scales with the build, and the install press states the bill

## Status

Accepted, 2026-09-22 (Marciano, DVTD-efjk). Supersedes
[ADR-082](082-build-space-is-rented-by-the-gate.md) decisions 1, 2, 3 and 5, and
restates its decision 4. The ladder and its prices are untouched.

## Context

ADR-082 Decision 1 made the bill the rung you *hold* rather than the weight you
*use*, and argued it this way: a bill that only charges for room you have filled
makes the empty half of a rung free, so there is never a reason to step back
down, and widening stops being a decision.

The reasoning is sound. Its premise is not. It assumes headroom is worth
something — that a player might rationally hold an 8 while using 5. Nothing in
the game pays for that. Rungs carry no perks, no prepayment discount and no
commitment term, and the only thing a wider rung buys is the right to install
something you have not installed yet, which you can buy at the moment you
install it instead.

So the dominant strategy at every shop is the same: hold the smallest rung that
fits. Six gates of play never deviated from it. What the panel actually asked
the player to do was perform that arithmetic by hand, every visit, and be
punished for forgetting. That is a chore wearing the costume of a decision.

Two alternatives were weighed before this one. A second billing mode
(`serverless.yml` — pay per occupied weight at a higher rate) was drafted and
dropped: a flat rate cannot sit above a doubling ladder at every size, so it
made serverless strictly better from weight 16 up and reserved pointless. Giving
rungs real perks was the other, and it adds a second axis of content to balance
in exchange for keeping a panel nobody wanted to think about.

## Decision

1. **The rung is derived from the build, never chosen.** A run occupies the
   smallest rung its billable weight fits in, and pays that rung at every clear:

   ```
   space  = smallest rung whose weight >= billableSlotsOf(build)
   upkeep = that rung's kb
   ```

   `BUILD_SPACE_RUNGS` is unchanged (`4/free · 6/16 · 8/32 · 12/64 · 16/128 ·
   24/256 · 32/512`). Only the act of picking goes away. This reverses ADR-082
   Decision 1 and deletes Decision 2 along with the picker it described.

   The quantisation is the pressure, not a rough edge: weight 5 pays for 6 and
   weight 9 pays for 12, so crossing 4 → 5 costs 16 KB a gate for the rest of
   the run. That is the decision ADR-082 wanted, moved to the moment it is
   actually made.

2. **Crossing a rung arms the install press.** An offer that would widen the
   rung states what it does before it commits: the press arms on the first
   press, opens `Build space scales 4 → 6` / `Upkeep becomes 16 KB a gate`, and
   installs on the second. An install that lands inside the rung already rented
   is a single press with no panel.

   This is the whole cost of Decision 1. The player no longer opts into the bill
   by picking a rung, so the thing that creates the bill has to say so. A price
   on a button is what a config costs once; the rung it rents is what it costs
   every gate after, and only the first of those fits on a button.

3. **Room refuses nothing below the top rung.** `hasRoomFor` measures against
   the top of the ladder (32), because a build that does not fit its rung rents
   the rung above rather than being held out of it. The registry's "refused for
   room before price" rule (ADR-082 consequences, wiki §5.2) now only fires at
   the top of the ladder.

4. **A bill the balance cannot cover caps the build until it fits.** The run
   pays for the widest rung it can afford, and that space becomes a cap the shop
   door holds it to — drop weight, or sell it — cleared when the run leaves the
   shop. Never fatal: the free rung costs nothing.

   This is ADR-082 Decision 4 restated for a derived rung. Its original wording
   drops the run to a cheaper rung, which is no longer a thing that can be done
   to a run: the rung *is* the build. So the shortfall becomes the cap instead,
   and ADR-082 Decision 3's door — the one lock on the exit — is what enforces
   it. The player still chooses what comes off, and selling refunds half.

5. **`BUILD_SPACE_FROM_GATE` is deleted.** The ladder is no longer something the
   shop stocks, so there is no gate for it to open at. ADR-082 Decision 5 held
   the *picker* back to the Boulder shop; with no picker, gating the derivation
   on a gate number would be the same "this mechanic does not exist" wall that
   decision existed to fix.

## Consequences

**`Build.slots` is deleted rather than redefined.** ADR-082 changed its meaning
from slots-bought to space-held; there is now no stored space at all, so nothing
can drift from the build. `spaceForBuild` and `upkeepForBuild` live in
`build.model.ts`, which already imported the ladder, so no new module edge.
`RunState` is a JSON blob, so a saved run carrying a stale `slots` key is ignored
with no migration.

**Vendor lock-in (ADR-087) keeps working with no new code.** The derivation reads
`billableSlotsOf`, which already excludes the locked config, so the exemption
still lowers the rung — and now lowers it visibly, since the rung follows.

**The bill cannot be dodged.** It is assessed in `closeWindow`, and the shop is
only open in `rewarding`, so there is no point between the last answer and the
close at which a build can be sold down. The bill lands on the build the gate was
actually run with, which is a more honest charge than reserved room ever was.

**The shortfall is measured after the subscriptions settle**, because a lapsed
config sheds weight too — a build the lapse already shrank into the covered space
owes nothing further.

**`BuildSpace.ui.tsx` is deleted**, with its story and spec, and the Build panel
takes over the bill: its header reads `5 configs · 7 of 8 weight · 1 free before
the bill becomes 64 KB · ↻ 32 KB a gate`. One surface owns the figure, as it did
before. `upkeepLabelOf` moves to its own `upkeep.ts` — both the Build header and
the weight track read it, and `Build.ui` imports `WeightTrack.ui`, so either
would have been a cycle.

**New in the kit:** `InstallScale.ui.tsx` (the armed press's panel, which rides
the popup slot `ConfigInfo` and `Upgrades` already share), `WeightTrack`'s
`preview` and `next` props, and `ChipInstall.scale` / `.armed`.

## What this does not decide

Whether the doubling ladder is the right curve is still DVTD-qkiq's question,
and it matters more now: under a derived rung the thresholds are the only thing
pricing a build, so their spacing is the whole difficulty dial. `KB_PER_PROVEN_SLOT`
and the rung prices remain tuned against each other and neither moves alone.
