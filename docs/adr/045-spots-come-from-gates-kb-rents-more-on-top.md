# ADR-045: Spots come from gates, KB rents more on top

## Status

> ⚠ **Superseded by [ADR-046](046-slots-are-bought-storage-is-capped-again.md)**
> (2026-08-30): the gate schedule and the extra-slot rent are both deleted. Slots are
> bought outright, and the KB cap this ADR removed is back as a seven-rung plan.

Accepted (2026-08-28, Marciano, DVTD-yu7z, revised the same day by DVTD-lxla).
**Supersedes [ADR-023](023-storage-capacity-is-a-subscription.md)** — the plan is
gone, and with it the KB cap it existed to rent. Amends
[ADR-044](044-capacity-is-spots-money-is-kb.md) Decision 2 (the plan is no longer
width's source; the gate schedule is, with rent on top) and
[ADR-030](030-gate-staged-unlocks.md) (the ladder is still gate-staged). Numbers
live in `SPOT_RUNGS` and `nextSpotRentKb` in `rules.model.ts`.

Decisions 3 and 4 were rewritten three times on the day they were accepted, as the
shop screen went in front of Marciano: a one-time rung purchase became a per-spot
rent, the per-spot rent became a staged ladder of extra-spot steps, and the buy-out
on those steps came back out again ("for now just make it rentable only"). The
earlier text is in the git history; keeping it here as superseded sections would
leave four contradictory rules in one file, which is worse than a rewrite in an ADR
that never shipped.

## Context

The holding cap was not doing any work. A mid-run playtest showed 320 KB held
against a 1024 KB cap: not binding, so not a decision. A ceiling only earns its
place as an anti-hoarding brake, and the run already had a better one in what the
shop charges — a drain creates pressure continuously, a ceiling only at the top.
Bundling the cap and the width onto one plan row also meant the plan sold two
things at once, and the player could not tell which one they were paying for.

## Decision 1: the KB cap is deleted, not moved

`STORAGE_CAP_KB`, every `capKb`, the clamp at *Climb on*, the burn on a downgrade
and the overflow-is-spend-it-or-lose-it rule all go. KB is a balance with no
ceiling. The shop header reads `320 KB · balance` and draws no bar, because a bar
against nothing was what made money read as fuel being consumed.

Raising a rarely-hit ceiling is also explicitly not a config: a card that lifts a
limit you seldom reach is dead for most of the run.

## Decision 2: width comes from gates, on a fixed schedule

Every run reaches the same ceiling by the same gate. Clearing the gate at a rung's
floor hands that rung over, free.

| spots | hands over on clearing |
| --- | --- |
| 4 | — (every run starts here) |
| 8 | gate 1 |
| 12 | gate 4 |
| 16 | gate 7 |
| 24 | gate 10 |

(`fromGate` in the code is a `gatesCleared` floor, one higher than the gate in this
table: `gatesCleared` reaches 2 the moment gate 1 falls.)

The schedule is the brake, and it is the reason to prefer this over the two
alternatives. A pure purchase ladder lets a rich run get wider than a poor one and
re-opens the width-buys-score-buys-width loop ADR-044 closed. A coverage-earned
ladder compounds a skill lead on the axis that already decides whether you clear. A
pure schedule is safe but makes width a non-decision — which is what the next
decision fixes.

## Decision 3: extra spots are a staged ladder, rented by the gate

Above the free width the shop sells four steps, and a step **is** its number of extra
spots. It is a radio group, not a press per spot: one decision, and dropping back to
`none` is how a run cancels rent it can no longer carry.

| step | rent | opens on clearing |
| --- | --- | --- |
| +1 spot | 8 KB a gate | — |
| +2 spots | 16 KB a gate | gate 2 |
| +3 spots | 24 KB a gate | gate 5 |
| +4 spots | 32 KB a gate | gate 8 |

The rent is **linear** at 8 KB a spot, so "+3 spots · 24 KB a gate" is three times
"+1 spot · 8 KB a gate" with no arithmetic to do. The step is a quarter of gate 0's
perfect clear, which keeps the fifth spot affordable in the opening shop.

**Depth stages the ladder, not price.** A linear rent alone would let a lucky early
balance buy the summit width at gate 1, which is the width-buys-score-buys-width loop
ADR-044 closed. A rising rent was tried first and rejected: it made every step a
separate sum, and it priced the top of the ladder out of the game entirely.

Rented spots land **on top of** whatever the gates have handed over, and the rent is
a subscription — it is charged at every clear for as long as the step is held, and
free width arriving later never pays it off. Every step also states the width it
makes ("+2 spots · makes 10"), because that is the figure the decision is actually
about.

## Decision 4: renting is the only way to hold one, and the rent is billed at the clear

**Extra spots cannot be bought outright.** A buy-out at ten gates of the step's rent
was built and then removed the same day: it added a second price, a second press and
a second piece of state (`ownedExtraSpots`) to a section whose whole point is one
choice. If it returns, the shape it had is in the git history — its argument was that
it also bought immunity from the default below, which is the half of the price KB
cannot express.

The rent lands at each clear, off the rewarded balance rather than the balance the
gate was played on — charging first would repossess spots the clear just paid for. It
settles ahead of the config subscriptions, because width is what every other decision
in the shop depends on and a lapsed config is the smaller loss. Clears only, so a
redo is free of it and `onMissKb` stays 0.

A balance that cannot cover the rent pays what it has and gives the whole step back.
That is the only thing in the run that narrows a
pipeline, and it is why `isOverCapacity` and the shop's exit lock (DVTD-i388) still
have work to do. It is also very hard to reach on today's numbers: the smallest clear
at gate 0 pays 6.4 KB against a maximum 8 KB rent there, and every gate after that
pays multiples of the whole ladder. The branch stays because it is the honest answer
to "what if the rent cannot be paid", not because it fires often.

A git-tag rescue opens on the width its depth owes and rents nothing, because width
is a function of how deep the run is and a rescue starts deep.

## Consequences

Deleted outright: the KB cap and every `capKb`, the insolvency plan downgrade,
`planDowngraded`, `gateBillKb`, `GateStake.billKb`, the storage plan's row on the
clear ledger, the storage meter on every surface, and the "Read-only must not shut
the shop on a gate the ladder unlocks on" constraint — a rung arrives by clearing a
gate, not by shopping, so a shut shop cannot withhold one. Renting is a shop write,
so Read-only does refuse it, which is fine: it withholds a purchase, not a rung.

Renamed, because the names carried the old model: `StoragePlan` → `SpotRung`,
`STORAGE_PLANS` → `SPOT_RUNGS`, `RunState.storagePlan` → `extraSpots`,
`change-plan` → `set-extra-spots`, `Plan.ui` → `ExtraSpotRow.ui`, and
`StoragePlan.ui` → `ExtraSpots.ui`. The section carries no presses at all: the radio
is the only control on it.

The free rungs no longer have rows of their own. The section is titled **Extra
spots**, and its `none` step states the free width in one line — which is the whole
of what the old five-row ladder was saying, since nothing on it was ever for sale.
`MAX_SPOTS` is now the last free rung plus every extra step, 28 rather than 24;
`FREE_SPOTS_CEILING` is the 24 the gates reach on their own.

One thing to watch in playtest. The rent is cheap against gate income — 32 KB a gate
at the top step against a 320 KB clear at gate 9 — so the interesting question is
whether renting is ever a real cost rather than an obvious yes. `EXTRA_SPOT_RENT_KB`
is the knob, and it is the same knob that decides whether the default can fire at
all.
