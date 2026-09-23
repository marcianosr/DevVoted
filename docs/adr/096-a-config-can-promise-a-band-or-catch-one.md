# ADR-096: A config can promise a band, or catch one

## Status

Accepted (2026-09-22, Marciano, DVTD-owif and DVTD-s9v4). Adds two configs, `sla`
and `try-catch`. Amends [ADR-076](076-the-closing-band-decides-what-it-costs.md)
Decision 5, whose "no retry, no peel, no choice" now has exactly one exception,
and records that the same ADR's Decision 3 describes a cut the engine does not
make. Supersedes nothing.

## Context

[ADR-091](091-a-config-can-put-its-earnings-at-risk.md) gave a config a reason to
read the closing band. It only ever *observed* one: Database is paid or rolled
back by a verdict it cannot change. The band itself — the thing ADR-076 named the
run's central dial — was still something the player received rather than
something they could bargain with.

Two directions were open. A config could put something on the band before it is
read, and a config could argue with the band after.

### A finding that reshaped the first one

The band → payout slope **does not exist in the engine**. `gateClearPayout` scales
by `correct / SLICE_WINDOW`, the raw count of right answers, and never sees a
band, a ratio or a ladder. `payoutRatioFor`, `gatePayoutKb` and `perfectBonusFor`
are built, spec'd, and reachable only from `src/test/kantoGate.factory.ts` and
their own spec.

**OK, HEALTHY and PERFECT pay identical KB.** ADR-076 Decision 3 says otherwise
("closing at 30% against a 40% line already pays 0.75x"), ADR-075 says otherwise,
and so does wiki §2.6. ADR-091 Decision 3 justified a call on that same claim one
day before this was found. The wiring is DVTD-tjc7; the three documents are
corrected alongside this one, because an ADR that states what is not live is how
the mistake propagated.

## Decision 1: SLA is promised in prep and paid on the close

Name OK, HEALTHY or PERFECT before the gate. Close in that band **or better** and
the gate's own payout rises 10%, 25% or 50%.

This makes SLA the first mechanism in the game where a better clearing band is
worth more KB than a thinner one. That is a stronger claim for a 2-slot config
than "a bonus on an existing curve" would have been, and it is deliberately
*not* the general slope: the base game still pays every clear alike, and a player
who wants the ladder has to buy it.

### The rate is read off the band promised, never the band landed in

Paying for the landing would make the promise free, and every promise would be
OK. Reading the promise is what poses the question the config exists for: promise
PERFECT and land HEALTHY and the agreement pays nothing, where a promise of OK
would have paid.

### A breach costs nothing

A floor, not a bullseye — [ADR-085](085-a-prep-time-bet-pays-coverage-on-a-floor.md)'s
reasoning, and for its reason. A penalty was considered, since a real service
level agreement pays credits on breach; it was left out because the decision is
already asymmetric without one, and because a config that bills the player for
missing is a demand, which ADR-035 keeps on the gate. ADR-085's other rule
carries too: asking for a band is not a demand, because it is an input the player
chooses to give.

### It settles after the band, where the estimate settles before it

Planning Poker's units join `unitsThisGate` *before* `gateRulingFor` reads it, so
a won bet can lift a gate over its own line. SLA cannot sit there: it is a
function **of** the band, and a payout that changed the band it was computed from
would be circular. It settles in the cleared branch only, and every other exit
drops the promise unpaid.

### The base is the gate's own prize

`clearKb`, flat `storageOnClear` grants included — the figure prep already prints
against each band on the band table. The uplift is a percentage of a number the
player was shown before they promised. Interest, the faucet, extra picks and
Database's commit are outside it: the promise said nothing about them.

## Decision 2: Try/Catch converts one fatal close into a held one

A gate closing in DANGER holds instead, owing its peel. The config is spent doing
it and deletes itself.

This is the re-aim DVTD-72d9 asked for on 2026-09-06, when the old Try/Catch
("survive one failed gate per run") was parked as obsolete: since ADR-037 a
missed gate already peels and re-runs, so there was nothing left to survive.
DANGER is the rule that still ends a run, and it is the one worth insuring.

The metaphor is the constraint. A catch handles an error **in flight**; it does
not restore state, which is why try/catch was rejected as ADR-036's checkpoint
carrier. Converting the verdict at the moment it is read is the only shape that
matches, and it is why the player still owes the peel and still has to retry: the
exception was handled, not undone.

### It is a fourth reason a gate holds, not a special case

`GateRuling` already carries `heldBy: "bare" | "floor" | "band"`, so the catch is
`"catch"` and every surface that reads a hold reason gets it for free.
`gateRulingFor` is pure and takes no `RunState`, but it does take the build, and
the build is where the catch lives — so the conversion is a branch in the ruling
and the *spending* is a build rewrite in `closeWindow`.

### It pays its own weight into the peel it just created

The quota is drawn on the build that closed the gate, catch included, and the
catch's removal then discharges `slotsOf(catcher)` of it — `stripOne`'s
arithmetic, reused. The catch is the first thing the peel takes. When its four
slots cover the whole quota the peel is settled outright and the run resumes
straight to the shop.

The alternative, drawing the quota after the deletion, hides the arithmetic: the
player would see a quota that does not match the build they had when the gate
closed. Charging the full quota *and* taking the config bills the same four slots
twice.

### A caught close cannot then die on the peel

`isPeelFatal` is skipped when the catch fired. Without that, the config dies in
exactly the thin, deep build it was bought for — and that branch is a remnant in
any case: ADR-037 Decision 2 is dead, and "peel to zero, then die on the strip
screen" is in `rejected.md`.

### Its absence from the build is the record that it fired

Config-object flags do not survive hydration — `refreshConfig` keeps only `level`,
which is why `minified` and `abArm` reset — but build membership does. No
"already used" flag exists, and none is needed. Re-drafting it in a later shop
buys a second catch at full price: "once" is a property of the instance, the same
way re-drafting Freemium pays the deep rate.

## Decision 3: a caught gate keeps the reading it actually had

[ADR-094](094-the-bands-are-cut-in-answers-and-widen-with-the-climb.md) holds a floor-held gate's
bar wherever the meter really sits, because clamping it down would print a SHAKY
bar the run never had. A caught hold is that rule read the other way: the meter
really was under the floor, and clamping it **up** into SHAKY would print a bar
the run never had either.

So the bar tells the truth and the verdict copy says the gate holds, and the
thing that explains the gap between them is the catch — named in the subtitle,
and chipped in saffron on the header, the idiom audits and grants already use
(ADR-064 Decision 2). ADR-028's rule is the general one: the receipt always names
what is in force.

## Consequences

- `RunState` gains `slaBand` / `slaUpliftKb` and `caughtFatalBy`. All three ride
  `RunSnapshot` for free and are optional, so no snapshot migration is needed.
- `meetsBand` is extracted in `coverageRatio.model.ts` and `atLeastBand` is
  re-expressed in terms of it. The clamp and the predicate were the same
  comparison written once; only the clamp was reachable.
- `CommittableBand` narrows the three promisable bands, so SHAKY and DANGER are
  unrepresentable as a promise rather than merely refused at runtime.
- `isPrepPhase` moves to `run.model.ts` and `canEstimate` now reads it. "Before
  gate 0, or the beat after a clear" was one rule stated in one place and about
  to be stated in two.
- The prep screen can now show three config controls at once (rebase, estimate,
  SLA) in one column. Nothing prevents it; the column simply gets tall.
- **SLA is not upgradable.** A level ladder would have to move percentages that
  are already the steepest lever in the config's own design.
- **Try/Catch cannot unlock on catching a fatal close** — you must own it to catch
  one — so it unlocks on depth instead.
