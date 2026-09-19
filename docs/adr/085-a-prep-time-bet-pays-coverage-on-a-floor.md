# ADR-085: A prep-time bet pays coverage on a floor

Status: Accepted — 2026-09-15. Supersedes 063. Amends 035 (what a config may ask of
the player) and 037 (what a missed gate pays).

## Context

Planning Poker and `git rebase -i` are the only two configs that act in prep. Both
reduced, both were spec'd, and both rode `RunView` — and neither had a control. The
kanto migration (DVTD-53bp) dropped `estimate`, `estimatedCorrect` and `rebaseSlots`
from `PrepViewProps` and nothing in `src/` dispatched either action. Rebase was worse
off still: it rewrites only `RunState.polls`, the one field `toRunSnapshot` drops, so
a reorder was served back in its original order on the next dispatch.

Wiring them exposed a design fault in the bet as it had already shipped.

## Decisions

**The number is a floor, not a bullseye.** Play `k` and the bet is "at least `k` of
this window's five correct". The rule it replaces required an exact call, which
inverts what a low card means: under a bullseye rule, playing 1 predicts that you will
bomb four of five.
Caution and a low card should be the same gesture; they were opposites, so no cautious
bet existed anywhere on the board and "why would you ever play the 1" had no answer.

**It pays coverage, not storage.** The bet is a claim about how well you will answer,
and coverage is what answering well produces. Paying KB made it an economy config
wearing a performance config's costume.

**The payout is `k × (gatesCleared + 1) × 0.25` units.** The rate is per point per
gate because the line it is measured against grows with depth: `scoringSlotsAt` is
`5 × (gate + 1)`. A flat payout would be a quarter of a window at gate 0 and rounding
error by gate 12. Scaling holds every card at a constant 5% of whatever the gate is
asking for, so card 5 is always worth a quarter of a window. The 0.25 is an anchor,
not a derived number.

**The bet settles inside the window, before the band is read.** The units join
`unitsThisGate`, so a won bet can lift a gate over its own OK line. Settling it
beside the window instead would make "extra coverage" mean nothing at the only moment
coverage is ever judged. A bet that overflows the gate's line spills into KB through
`surplusPayoutKb` rather than being wasted.

**The estimate still runs 1 to 5, free, every gate.** A dealt deck of spent cards
(DVTD-6ce4) is the more interesting object and stays on the shelf; nothing here blocks
it.

**`git rebase -i` gains a second version.** v1 lists the gate's polls by category, the
way the real `rebase -i` lists subject lines rather than diffs. v2 also names which of
them take more than one answer. Answer types are Prefetch's headline reveal and
multiple choice pays double (ADR-081), so handing them over at v1 would make a 4-slot
config redundant. The upgrade is what buys the overlap.

**The order is moved with presses, not with a drag.** One press is one `{from, to}`,
it is reachable from the keyboard, and it needs no drag library. `movedSlice` is a
splice-move, so an adjacent move reads as the swap it looks like.

**A committed reorder is written to `run_polls` inside the dispatch transaction.**
Positions are held fixed and the poll sitting at each one is reassigned, because the
table is unique on `(run_id, position)` and moving rows to new positions collides with
that constraint partway through the sweep.

## Kept from the rule it replaces

**It pays after a missed gate**, the third exception to ADR-037's rule that a miss pays
nothing. If a low estimate could only pay on a gate that cleared anyway, nobody would
make one and the config would collapse into a bonus for perfection.

**Asking for a number is not a demand.** ADR-035 says configs demand nothing, meaning
no config may impose a knowledge requirement. An input the player chooses to give is a
different thing, and the gate still owns every requirement.

**The bet locks on the gate's first answer**, enforced by run status rather than by a
flag: `canEstimate` and `canRebase` are both true only in `configuring` and
`rewarding`.

**A committed bet and no bet are different states.** `estimateThisGateUnits` is
undefined when no number was committed and a number (0 included) when one was, which
is what lets the gate report tell "no bet" from "lost the bet".

**The reward report keeps its one failing row**, and still reads pass or fail off what
the engine actually paid rather than recomputing the comparison.

**No upgrade path for Planning Poker.** A level that merely multiplies the money
changes no decision.

## Consequences

The unlock metric stays spelled `exact-estimates`. It is a persisted primary-key
column, so renaming it would orphan every player's progress; only the player-visible
copy changed.

Planning Poker is 1 slot, and at 80% accuracy "at least 3 of 5" lands 94% of the time
for a near-free 15% of the gate's line. That looks underpriced for the cheapest config
on the roster. Left at 1 for the first playtest rather than tuned blind.

The estimate's row on the gate report renders its units through `percent()`, which is
what every other coverage row on that report already does. Those rows have been
reporting units as percentages since before this change; it is a pre-existing fault in
the whole coverage-row family and fixing it here alone would make this one row
disagree with its neighbours.
