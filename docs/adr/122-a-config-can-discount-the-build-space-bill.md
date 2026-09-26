# ADR-122: A config can discount the build space bill, by less than a rung is worth

## Status

Accepted — 2026-09-26 (Marciano, DVTD-1b38). Ships YAGNI. Amends
[ADR-087](087-a-config-can-be-exempt-from-the-space-it-fills.md)'s claim that a
per-config term cannot reach the bill. Answers
[ADR-082](082-build-space-is-rented-by-the-gate.md) Decision 1 rather than
reversing it. Extends [ADR-098](098-build-space-scales-with-the-build.md)
Decision 2.

## Context

The ladder is coarse on purpose. A build occupies the smallest rung its weight
fits in and pays that rung at every clear, so weight 9 rents 12 and bills 64 KB
with three slots standing empty. ADR-098 calls that quantisation "the pressure,
not a rough edge".

Nothing in the roster had ever touched the bill. Weight and minify move it by
moving the weight; vendor lock-in moves it by hiding one config's weight. ADR-087
recorded why there was no third way: _"`settleUpkeep` never sees the configs, so
a per-config term could not reach it even if we wanted one."_

That sentence is no longer true of the code. `settleUpkeep(build: Build,
balanceKb: number)` takes the whole build, `build.configs` included. The obstacle
ADR-087 described has not been argued away — it has simply gone.

What remains is ADR-082 Decision 1, which is a real argument and still live: a
bill that follows weight-in-use _"makes the empty half of a rung free, so there
is never a reason to step back down, and the decision to widen stops being a
decision at all."_

## Decision

1. **A config may take a flat figure off the bill for every empty slot.**
   `emptySlotDiscountKb` names the per-slot credit. `emptySlotCreditOf(build)`
   multiplies it by `freeSlots(build)`, and `upkeepAfterCreditOf(build)` is what
   `settleUpkeep` now owes, floored at zero. YAGNI carries 8 KB and is one slot.

2. **8 KB, because that is the largest step at which climbing a rung is still a
   loss.** This is the whole answer to ADR-082 Decision 1, and it is arithmetic
   rather than taste. The credit must never exceed the gap between one rung's
   price and the next, divided by the empty slots the wider rung opens:

   | crossing | bill after | empties | break-even |
   | -------- | ---------- | ------- | ---------- |
   | 8 → 12   | 64         | 3       | 10.67      |
   | 6 → 8    | 32         | 1       | 16         |
   | 16 → 24  | 256        | 7       | 18.3       |
   | 12 → 16  | 128        | 3       | 21.3       |

   The 8 → 12 crossing binds at 10.67, so 8 clears every rung with room to spare.
   Stepping back down also still always saves, because dropping a rung saves more
   than the empties of the rung above are worth. Widening stays a decision and
   narrowing stays a reason. Above about 10 the config would invert both, which
   is the failure ADR-082 named.

3. **Flat, not pro-rata and not a percentage.** Pro-rata is exactly the
   weight-in-use bill ADR-082 Decision 1 rejects. A percentage breaks outright:
   at 10% a slot, a 17-weight build would pay 77 KB where a 16-weight build pays
   128, so adding a config would make a run cheaper. Flat also states itself —
   the build panel already reads "1 free before the bill becomes 64 KB", so the
   player multiplies a figure they are already shown.

4. **The config's own weight counts.** No exemption, and deliberately not the one
   ADR-087 built: `billableSlotsOf` keeps its single vendor-lock carve-out. YAGNI
   fills one of the slots it pays for, and installing it into a build flush with
   its rung raises the bill instead of lowering it. That is the decision the
   config exists to ask, and it is the honest reading of the name — it costs a
   slot to tell you that you do not need slots. Exempting it would make it pure
   upside and always correct to install, which is the pillar 3 tension ADR-042
   logs and the reason "raising the cap with a config" sits in the rejected log.

5. **The arming press fires on the bill, not only on the rung.** ADR-098 Decision
   2 armed an install that widens the rung, because "the thing that creates the
   bill has to say so". With a per-empty-slot credit held, an install that lands
   inside the rung already rented also raises the bill, by consuming an empty
   slot. `scaleFor` now returns whenever the space _or_ the per-gate figure
   moves, and `InstallScale` drops its "Build space scales" line when the rung is
   unchanged, stating the new upkeep alone. Running YAGNI therefore makes every
   install arm, which is what the config is for.

6. **The credit reduces what is owed, not what insolvency can cover.** When the
   discounted bill still outruns the balance, the fallback pays
   `upkeepForSpace(highestAffordableSpace(balance))` undiscounted: that question
   is which rung a balance covers, which is a fact about the ladder rather than
   about the build.

## Consequences

A discounted bill can keep a run solvent that would otherwise have been capped,
since the credit lands before the balance comparison. That is a second, quieter
thing YAGNI buys, and it only ever helps.

Every surface that quotes the bill now quotes the discounted figure: the build
panel's upkeep badge, the prep Subscriptions ledger, the gate stake, the armed
install press and the run-over badge. `PrepFrame` gains `spaceBillKb` rather than
re-deriving the bill from a bare space number, which it could not have done
correctly anyway — a space number cannot see a vendor lock.

The run-over screen's _"N weight of it never paid for itself"_ is wrong with a
credit held, because that weight did pay. It now reads _"N weight of it stayed
empty, taking X KB a gate off the bill"_ when the credit is non-zero.

`freeSlots` reads `billableSlotsOf`, so a vendor lock raises the empty count and
stacks with the credit. That is left as it falls rather than carved out: both
configs are paid for, and the build still cannot leave the shop over its cap.

YAGNI is worth nothing on the free rung, worth nothing to a build flush with its
rung, and worth most to a build sitting low in a wide one — between 8 and 48 KB a
gate. That spread is the decision, and the build panel states the inputs to it
before the shop takes any money.
