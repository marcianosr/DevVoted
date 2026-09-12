# ADR-074: Weight is what the build costs to run

## Status

Accepted 2026-09-12 (Marciano, DVTD-nd6r). Supersedes
[ADR-046](046-slots-are-bought-storage-is-capped-again.md) in all three
decisions and [ADR-049](049-the-archive-opens-a-run-wider.md) entirely. Takes
over the peel from [ADR-037](037-a-missed-gate-peels-a-config.md) Decision 1 and
gives it a different trigger.

**Nothing is built.** `SLOT_PRICES_KB` and `STORAGE_PLANS` in `rules.model.ts`
still run the old rules, and the shop, the gate and `run.validation.ts` all read
them. Both ADRs stay in place until that code goes.

## Context

Width had three prices at once. A config cost KB on the shelf, it needed a slot
bought off a x1.25 ladder (ADR-046 Decision 1), and that ladder needed a storage
plan under it to hold the money long enough to save for a rung (ADR-046
Decision 3). Three purchases for one decision, and the two that were not the
config itself were both one-off: once bought, a wide build cost nothing to keep.

That is the wrong pressure. The interesting question about a build is not
whether you could afford it once, it is whether you can keep affording it while
the gates get harder, and a price paid once cannot ask that. ADR-046 saw the
same problem and answered it by making the purchase price escalate, which delays
the moment width stops mattering without removing it.

## Decision

### 1. Weight bills KB at every gate

The first 4 weight is free. Above that the build pays recurring upkeep on every
gate close. The rungs:

| Weight | 4 | 6 | 8 | 12 | 16 |
| --- | --- | --- | --- | --- | --- |
| Upkeep (KB/gate) | 0 | 16 | 32 | 64 | 128 |

They live here rather than in a model file only because no model file owns them
yet. The first code that implements this takes them, and this table collapses to
a pointer. **Open:** what happens between and above the rungs, whether the curve
interpolates or steps.

### 2. Capacity is soft, and the slot ladder goes

There is no slot to buy and no 24-slot ceiling. Install whatever you can pay
for, and keep paying for it. ADR-046 Decisions 1 and 2 (the x1.25 ladder, the
high-water-mark cash-back) retire, and ADR-049 retires with them, since buying
start slots out of the archive was its entire subject.

The brake moves from the purchase price into the bill, which is the better place
for it: a price paid once stops mattering, a bill that lands every gate has to
be beaten every gate.

### 3. The storage plan sells free weight and a cheaper bill

The subscription's job is now how much build you can run cheaply: more free
weight, a discount on the upkeep, or both. The seven-rung KB cap of ADR-046
Decision 3 retires.

The plan stops being a savings instrument and becomes the capacity decision
itself. That is a simpler thing to price, because a rung is now worth exactly
the upkeep it saves, instead of being worth "the slot rung it lets you save
for", which is what made the old ladder need two retunes.

### 4. A bill you cannot pay peels configs until it fits

Insolvency is not fatal and it is not a debt. The player drops configs, their
choice which, until the upkeep is payable. This is ADR-037's peel with the
trigger changed: it used to fire on a missed gate, and it now fires on an
unaffordable build.

The peel reads better here than it did there. As a miss penalty it retried a
gate you had just failed with a build 25% smaller, which is a doom loop. As an
insolvency rule it is a consequence you can see coming a gate in advance, priced
in a number that is on screen the whole time.

## Consequences

**Weight now pays and bills at once.** `gatePayoutKb` already scales the gate
reward by weight (`ratio / healthyAt(gate)` capped, times weight, times 32 KB,
times the streak). A heavy build earns more per gate and costs more per gate,
and the run is the question of whether the first outruns the second. That is the
tension the one-off slot price never had. It also means the upkeep curve and
`KB_PER_PROVEN_SLOT` are tuned against each other, and neither can move alone.

**"Over capacity" stops being a state.** ADR-044 Decision 4 made over-capacity a
screen, and the shop's Continue is held shut while `overflowSpots > 0`. With no
slot ceiling there is no overflow. The door that shuts is now the unpayable
bill, which ADR-046's own "a rung you cannot pay for is not for sale" already
models: the same refusal, applied to the build instead of the plan.

**The archive loses its run-start job.** ADR-049 spent the meta-currency on
opening a run wider. With width unbought, the archive needs a new sink or it
becomes a number that only goes up. **Open**, and not answered here.

**The storage cap comes off, for the third time.** ADR-045 deleted it, ADR-046
restored it, and this deletes it again. The reason it came back was that a
mid-ladder slot cost more than a mid-run balance, so the cap was what stopped a
run banking straight to the top of the ladder. There is no ladder to bank toward
now, so the argument does not carry, but nothing else clamps a balance either.
If banking turns out to be the dominant line, the brake is the upkeep curve
first, not a fourth attempt at a cap.

**Six ADRs point at 046 for something.** ADR-008, ADR-015, ADR-019 and ADR-044
all end a dead decision with "ADR-046 owns it"; ADR-049 amends it and ADR-039
prices upgrades against it. Those pointers now aim one link short of the truth
and are updated to reach here.
