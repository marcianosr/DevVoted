# ADR-074: Weight is what the build costs to run

## Status

Accepted 2026-09-12 (Marciano, DVTD-nd6r). Supersedes ADR-046 (retired) in all
three decisions and ADR-049 (retired) entirely.

**Built 2026-09-14 by [ADR-082](082-build-space-is-rented-by-the-gate.md)**,
which amends three of the four decisions below. Read 082 for what runs:

- Decision 1's ladder is live, but the bill is read off the rung the player
  holds, not the weight in use.
- Decision 2 is reversed. Capacity is hard again, enforced at the shop door.
- Decision 3's subscription is gone. The rung ladder *is* the capacity decision.
- Decision 4's peel is gone. An unpayable bill drops the rung instead, and the
  door takes it from there. The peel survives only as
  [ADR-037](037-a-missed-gate-peels-a-config.md)'s miss penalty, narrowed to
  SHAKY by [ADR-076](076-the-closing-band-decides-what-it-costs.md).

## Context

Width had three prices. A config cost KB on the shelf, it needed a slot bought
off a x1.25 ladder (ADR-046 Decision 1), and that ladder needed a storage plan
to hold the money long enough to save for a rung (ADR-046 Decision 3). The two
that were not the config itself were one-off: once bought, a wide build cost
nothing to keep.

That is the wrong pressure. The interesting question is whether you can keep
affording a build while the gates get harder, and a price paid once cannot ask
that. ADR-046 answered the same problem with an escalating purchase price, which
delays the moment width stops mattering without removing it.

## Decision

### 1. Weight bills KB at every gate

The first 4 weight is free. Above that the build pays recurring upkeep on every
gate close. The rungs:

| Weight | 4 | 6 | 8 | 12 | 16 |
| --- | --- | --- | --- | --- | --- |
| Upkeep (KB/gate) | 0 | 16 | 32 | 64 | 128 |

They live here only because no model file owns them yet; the first code that
implements this takes them, and this table collapses to a pointer. **Open:**
what happens between and above the rungs, whether the curve interpolates or
steps.

### 2. Capacity is soft, and the slot ladder goes

There is no slot to buy and no 24-slot ceiling. Install whatever you can pay
for, and keep paying for it. ADR-046 Decisions 1 and 2 (the x1.25 ladder, the
high-water-mark cash-back) retire, and ADR-049 with them, since buying start
slots out of the archive was its entire subject.

The brake moves from the purchase price into the bill, because a price paid
once stops mattering and a bill that lands every gate has to be beaten every
gate.

### 3. The storage plan sells free weight and a cheaper bill

The subscription now sells how much build you can run cheaply: more free
weight, an upkeep discount, or both. ADR-046 Decision 3's seven-rung KB cap
retires.

The plan stops being a savings instrument and becomes the capacity decision.
That is simpler to price: a rung is worth exactly the upkeep it saves, not "the
slot rung it lets you save for", which is what made the old ladder need two
retunes.

### 4. A bill you cannot pay peels configs until it fits

Insolvency is neither fatal nor a debt. The player drops configs, their choice
which, until the upkeep is payable. This is ADR-037's peel with the trigger
changed from a missed gate to an unaffordable build.

The peel reads better here. As a miss penalty it retried a gate you had just
failed with a build 25% smaller, which is a doom loop. As an insolvency rule it
is a consequence you see coming a gate in advance, priced in a number that is
on screen the whole time.

## Consequences

**Weight now pays and bills at once.** `gatePayoutKb` already scales the gate
reward by weight (`ratio / healthyAt(gate)` capped, times weight, times 32 KB,
times the streak). A heavy build earns more and costs more per gate, and the run
asks whether the first outruns the second, a tension the one-off slot price
never had. The upkeep curve and `KB_PER_PROVEN_SLOT` are tuned against each
other, and neither can move alone.

**"Over capacity" stops being a state.** ADR-044 Decision 4 made over-capacity a
screen, and the shop's Continue is held shut while `overflowSpots > 0`. With no
slot ceiling there is no overflow. The door now shuts on the unpayable bill,
which ADR-046's "a rung you cannot pay for is not for sale" already models,
applied to the build instead of the plan.

**The archive loses its run-start job.** ADR-049 spent the meta-currency on
opening a run wider. With width unbought, the archive needs a new sink or it
becomes a number that only goes up. **Open**, and not answered here.

**The storage cap comes off, for the third time.** ADR-045 deleted it, ADR-046
restored it, and this deletes it again. It came back because a mid-ladder slot
cost more than a mid-run balance, so the cap stopped a run banking straight to
the top of the ladder. With no ladder to bank toward, that argument does not
carry, but nothing else clamps a balance either. If banking becomes the dominant
line, the brake is the upkeep curve first, not a fourth attempt at a cap.

**Six ADRs point at 046 for something.** ADR-008, ADR-015, ADR-019 and ADR-044
all end a dead decision with "ADR-046 owns it"; ADR-049 amends it and ADR-039
prices upgrades against it. Those pointers are updated to reach here.
