---
# DVTD-gv0v
title: Playable proto for the coverage-as-ratio model
status: scrapped
type: task
priority: critical
created_at: 2026-09-11T16:32:18Z
updated_at: 2026-09-16T18:56:44Z
---

Coverage today is a sum with a % glued on: aggregateRunCategoryCoverage reduces `sum + currentCoverage`, and COVERAGE_DEMANDS = [3, 10, 25 ... 375] (rules.model.ts:96) are hand-tuned point targets. Gate 1 asks 3%, gate 12 asks 350%. The number does not mean what it says.

Explored redesign: `coverage = coveredSlots / capacitySlots`, flat 80% bar forever, capacity granted by gates. A Monte Carlo sim (20k trials/cell) found two of the three parameters are not free:

- +15% capacity/gate is forced: with a `max(prev + 1, ...)` floor the ladder is `4 5 6 7 8 9 10 12 14 16 18 21 24`, ending at exactly MAX_SLOTS (24).
- Void share is the only real dial: at grant 15%, win rate at 70% accuracy runs void 4% -> 69%, 6% -> 39%, 7% -> 26%, 8% -> 16%, 10% -> 8%.
- The run does not start until gate 7 (gates 0-6 pass at 94-96% under every parameter set tried).
- Multiplier configs act as a catch-up mechanic (32x win-rate swing at 60% accuracy, 1.2x at 90%).

Numbers on a page are not the same as playing it. Build a throwaway playable rig so the model can be felt before anything real is touched.

## Approach

Parallel sandbox. Nothing existing changes behaviour. A ratio inside the real engine would hit roundToOneDecimal (applied to coverage at 7 sites, quantizing a 0..1 ratio to 10% buckets), the multiplicative unbounded effect algebra (overclock swings x8), ~6 spec files with real arithmetic coupling, and 3 persistence sites.

Coverage is a single aggregate number in this proto: covered / capacity, no per-config allocation and no category matching. That is exactly what the sim validated.

## Todo

- [x] `src/modules/run/build/domain/coverageRatio.model.ts` -- pure model (COVERAGE_BAR, CAPACITY_GRANT, VOID_SHARE, capacityLadder, capacityAt, coverageRatioOf, clearsBar, coverAnswer, voidAnswer, slotsOwed)
- [x] `coverageRatio.model.spec.ts` -- deterministic specs, pin the `max(prev + 1, ...)` floor
- [x] `src/ui/kanto-theme/CoverageRing.ui.tsx` -- additive optional `ceiling` prop, defaults to today's behaviour
- [x] CoverageRing story + spec case for the pinned ceiling
- [x] `src/routes/proto-coverage.tsx` -- dev rig, PROD guard, real CONFIGS roster, kanto parts
- [x] `.dependency-cruiser.cjs` -- add `coverage` to DEV_RIG_ROUTES alternation (FLAGGED config change)
- [x] Verify: npm test pass count unchanged, npm run lint, npm run build

## Notes

Partly serves DVTD-8gns (No simulation models run income): coverageRatio.model.ts is the first pure-function balance model in the repo.

Out of scope: per-config coverage allocation and category matching, audits voiding coverage, touching COVERAGE_DEMANDS / build.model.ts / answer.model.ts / schema, wiring kanto screens to the engine.

## Summary of Changes

Built as planned, parallel sandbox, nothing existing changed behaviour.

- `src/modules/run/build/domain/coverageRatio.model.ts` -- pure model. Ladder verified at `4 5 6 7 8 9 10 12 14 16 18 21 24`, ending on MAX_SLOTS (24).
- `coverageRatio.model.spec.ts` -- 27 specs.
- `CoverageRing.ui.tsx` -- additive optional `ceiling` prop, `pinned ?? Math.max(...)`. No existing caller changed.
- `CoverageRing` +4 specs, +2 stories (PinnedToHundred, RatioLadder).
- `src/routes/proto-coverage.tsx` -- playable rig, PROD guard, real CONFIGS roster and draft costs, kanto parts.
- `.dependency-cruiser.cjs` -- `coverage` added to the DEV_RIG_ROUTES alternation (explicit name, not a wildcard).

Verification: tests 246 files/4406 passed -> 247/4437 (+1 file, +31 tests, nothing existing moved). `npm run lint` clean, depcruise 0 violations across 995 modules. `npm run build` exit 0, 0 TS errors.

## Finding the sim missed

Building it surfaced a rule the Monte Carlo never modelled: **covered slots are capped by OCCUPIED slots, not capacity** (an empty slot holds no code to test). That cap collapses the strategy space.

Deterministic replay, gates cleared of 13:

| accuracy | buy exactly to the bar | buy to full capacity |
|---|---|---|
| 60% | 1 | 9 |
| 80% | 1 | 13 |
| 100% | 13 | 13 |

Buying to the 80% bar leaves zero headroom: one wrong answer voids a share, and the occupied cap means you can never climb back. So the intended corridor (build between 0.8x capacity and capacity) has **no interior** -- only the top edge is viable, and the shop decision collapses to "buy whatever fits".

That is a genuine design problem to resolve before this model is promoted. Caveat on the table above: it is a deterministic replay (4 rights then 1 wrong, every gate), so it overstates survival badly versus the stochastic sim. Do not read win rates off it.

Also confirmed: never buying dies at gate 2, so forced growth works.

## Follow-up: two models, toggleable

Marciano: "in model A, you are basically forced to buy a config, that is weird to me. Configs should be strategic, but come with a cost as well." Correct, and structural.

Added a second model behind a toggle. `gateCheckFor(model, gate, occupied, covered)` in `coverageRatio.model.ts` is the one seam; the rig's MODEL panel switches and restarts.

- **capacity** (model A): denominator is the granted capacity, `covered <= min(occupied, capacity)`. The gate grants capacity whether you want it or not and the bar forces you to fill it, so buying is a tax.
- **weight** (model B): denominator is the build's own weight, gate demands `weight >= capacityAt(gate)` as a separate check. Installing dilutes on the spot, so a config costs KB once and ongoing dilution forever. No install cap, since the ratio is its own ceiling.

Verification after the toggle: 247 files / 4446 tests passed (+9), lint clean, depcruise 0 violations, build exit 0.

Open question for playtest: if model B feels right, delete model A rather than carry both.

## Model A scrapped, floor ratchet added

Marciano: "Scrap model A." Done, deleted rather than branched: `capacityAt`, `CAPACITY_LADDER`, `coverableSlots`, `canReachBar/Floor`, `slotsToInstall/Survive`, `canInstall`, `gateCheckFor`'s model param and the rig toggle are all gone. `readCoverage(weight, covered, gate)` is the one entry point.

Then: "when are you actually game over?" With a flat 60% floor, never. 0-for-5 from 100% leaves you at 69.6%, so a window can only kill you if you ENTER it below 86.2%.

Fixed with a per-gate ratcheting floor (his idea): none / none / 60 x4 / 70 x4 / 80 x3, band-aligned. Void share was the wrong dial for this: it is a share of covered, so it is scale-invariant and sinks every build in the same 8 misses regardless of weight.

Deaths now cluster on the ratchet steps (weight 16, p=.6): gate 6 takes 273, gate 10 takes 613, versus 33-54 across gates 2-5. `nextRatchet(gate)` drives a UI warning so the step is anticipatable.

Verification: 247 files / 4445 tests, lint clean, depcruise 0 violations, tsc clean.

Open: the rig models config COST but not config POWER (ESLint's elimination, Prefetch, Telemetry do nothing), which is why a lean build still looks dominant. Wiring one accuracy-helper is the next experiment.

## Model C: reset per gate

Marciano: "Coverage resets to 0% at the start of every gate." Model B replaced.

Raw points per correct scale with gate depth, weight divides them into percent,
misses cost a ramping share of a hit, death is checked once at gate close.

- [x] `coverageRatio.model.ts` -- delete void + ratchet machinery, add BASE_RAW/LOSS_LADDER/rawPerCorrectAt/netRawAfter/bankedScore
- [x] `coverageRatio.model.spec.ts` -- rewrite, pin the max-survivable-weight table as the balance contract
- [x] `proto-coverage.tsx` -- netRaw/streak/score state, reset on gate open, rewrite copy
- [x] Verify: npm test, npm run lint, npm run build

### Model C built

Rules: coverage resets to 0% each gate; a correct answer earns `BASE_RAW * (gate + 1)` raw, flat within a gate; `coverage% = clamp(0, 100, netRaw / weight)`; a miss costs `lossShareAt(gate)` of a correct answer, ramping `0 0 0 .2 .3 .4 .5 .6 .7 .8 .9 1 1`; death is checked once at gate close against `floorAt`; a cleared gate banks `ratio * weight * streakMultiplier(streak)`, the answer streak carrying across the reset.

BASE_RAW = 30, picked so perfect play can carry MAX_SLOTS (24): at gate 12 five of five supports weight 27.9, four of five 16.7.

**This answers the corridor-collapse finding that blocked model B.** 20k-trial Monte Carlo, score optimum by per-poll accuracy:

| accuracy | best weight | score | win rate | win rate at weight 4 |
|---|---|---|---|---|
| 60% | 8 | 25.1 | 0% | 6% |
| 70% | 8 | 44.2 | 4% | 28% |
| 80% | 8 | 76.1 | 23% | 65% |
| 90% | 14 | 143.0 | 54% | 94% |

The optimum is interior at every skill level and moves heavier as skill rises. Two forces make the interior: the 100% cap punishes being too light (weight 4 at gate 6 caps out on three of five and banks 4), the floor punishes being too heavy (weight 24 dies to one miss from gate 6). Score and survival trade honestly: at 80% accuracy weight 4 wins 65% and scores 55, weight 8 wins 23% and scores 76.

Deleted with model B: `VOID_FLAT`, `VOID_SHARE`, `slotsVoidedBy`, `voidAnswer`, `missesToFloor`, `ratchetsAt`, `nextRatchet`, the `doomed` peril, `coveredAfterSale`, `slotsPerCorrectFor`, `pointsPerAnswer`, `coverAnswer`.

Added: `BASE_RAW`, `LOSS_LADDER`, `lossShareAt`, `rawPerCorrectAt`, `rawPerMissAt`, `netRawAfter`, `rawToReach`, `rawOwedFor`, `bankedScore`, `heaviestSurviving`. The last one drives a rig readout ("four of five at this gate carries weight N") and pins the balance table in specs.

Verification: 247 files / 4454 tests passed (was 4445, +9, nothing existing moved). `npm run lint` clean, depcruise 0 violations across 995 modules. `npm run build` exit 0, tsc clean.

Still open: the rig models config COST but not config POWER, so the sim assumes fixed accuracy regardless of what you install. Real configs would raise accuracy, pushing the optimum heavier than the table shows.

### Playtest finding: the late gates were not harder

Marciano, playing gate 3 on weight 4 + Intellisense: "I can cheat my way out now?"

He was right to be suspicious, and the cause was worse than a strong light build.
Rights needed to SURVIVE, bare weight 8, was `0 0 0 2 2 3 3 3 3 4 4 4 4`. The run
stopped getting harder at gate 7 and the ceiling flatlined at weight 17 for the
last four gates. Gate 12 asked exactly what gate 7 asked.

Cause: raw grows linearly with `(gate + 1)`, so from gate 3 to 12 raw grows 3.25x
while the bar grows 3.17x. They cancel. The relative difficulty index
`bar / (30 * (gate+1))` peaks at gate 7 (0.292) and FALLS to 0.244 by the champion.

**The bar can never be the difficulty dial.** Making gate 12 harder than gate 3 in
proportion to the raw growth needs a bar above 100%, which does not exist. A
percentage bar has a ceiling; raw does not. Reshaping HEALTHY_LADDER was explored
and can only narrow the gap, never close it.

Fix, his pick ("D-soft"): the miss cost keeps climbing past 1.0. LOSS_LADDER is now
`0 0 0 .2 .3 .4 .5 .7 .9 1.2 1.5 1.8 2.0`, identical to before through gate 6 and
steepening only where the flatline began. At the champion a miss costs two correct
answers, so three of five is fatal at any weight and four of five caps you at 11.

Heaviest build surviving at four of five, gates 3 to 12:
- before: 24 24 24 21 18 18 **17 17 17 17**
- after:  24 24 24 21 18 17 15 14 12 11 (strictly falling from gate 6, pinned by spec)

Interior optimum survives: best weight W8 / W8 / W12 at 70 / 80 / 90% accuracy,
win rates 2% / 18% / 38% (was 4% / 23% / 54%).

Also fixed: `heaviestSurviving` returned 136.8 on screen. It now clamps to
MAX_SLOTS, since a weight you cannot build is not an answer.

Verification: 247 files / 4458 tests passed, lint clean, depcruise 0 violations, build exit 0.

### Playtest finding: you could start below the minimum build

Marciano, on gate 2 at weight 2: "45% coverage?"

The 45% was correct (gate 2 pays `30 * 3` = 90 raw, weight 2 divides it), but he
should never have been on weight 2. `MIN_WEIGHT` was enforced when selling but
`beginRun` only blocked weight 0, so the starter screen let a run begin below the
floor the shop would never sell down to. Two floors, one constant, disagreeing.

The sim shows why the floor exists. Rights needed to survive:

```
gate    :  0  1  2  3  4  5  6  7  8  9 10 11 12
weight 1:  0  0  0  1  2  2  2  3  3  3  4  4  4
weight 2:  0  0  0  1  2  2  2  3  3  3  4  4  4   <- identical
weight 8:  0  0  0  2  2  3  3  3  4  4  4  4  4
```

Because coverage caps at 100%, below roughly weight 4 the cap binds at every gate,
so going lighter buys ZERO extra survival and only lowers the score ceiling. W1 and
W2 share a win rate (8 / 33 / 76% at 70 / 80 / 90% accuracy) and W2 scores exactly
double W1. **Sub-BASE_SLOTS weight is a strictly dominated dead zone, not a build.**

Fixed:
- `beginRun` and the start button both gate on `MIN_WEIGHT`, labelled "N more weight to start"
- `STARTER_BUDGET` and `MIN_WEIGHT` both derive from `BASE_SLOTS` instead of a repeated literal 4
- picking copy now says why the floor exists rather than just asserting it
- gates with no floor say "nothing you answer can close it" instead of "carries any weight", which was true but useless

Verification: 247 files / 4458 tests passed, lint clean, depcruise 0 violations, build exit 0.

### Playtest finding: weight is a score ceiling and nothing else

Marciano on the shop offers: "I dont understand what these badges mean" -- every
row read `48% on four of five` / `banks 2.9, now 2.9`, identical across five offers.

The badges were not broken. They were correctly reporting that the purchase was
worthless, and that exposes the real problem:

```
bankedScore = ratio * weight,  ratio = netRaw / weight / 100
=> ratio * weight = netRaw / 100.  THE WEIGHT CANCELS.
```

So `score = min(netRaw / 100, weight) * streakMultiplier`. Weight is purely a
score CEILING. Below the cap every weight banks the same:

| weight | ratio | banks |
|---|---|---|
| 8 | 81% | 6.48 |
| 12 | 54% | 6.48 |
| 16 | 41% | 6.48 |

Buying weight banks nothing until you would have capped out anyway, and it always
costs survival. The marginal shop decision has no gradient: it is strictly negative
below the cap and positive at it, a step function rather than a curve.

This is defensible as a design (weight is a bet on your own accuracy: you only
profit from it if you fill it) but it was completely hidden by the UI. NOT changed
without a decision from Marciano; see the open question below.

Also: he noticed coverage gain per poll never moves even as the streak climbs.
Correct and by design (raw is flat, so streak cannot affect survival), but the
badge showed a bare `x2.0` next to the coverage readout with nothing saying what
it multiplied.

Fixed:
- new model helpers `rightsToFill` and `rightsToSurvive`, both spec-pinned
- shop now states once: "weight only starts paying from N of 5 right; below that
  buying is pure downside", instead of a per-row score delta that was always zero
- each offer shows `ceiling W -> W+n` and `survives on 3 -> 4`, the two things that
  actually change
- streak badge reads `score x2.0`, plus a blurb saying streak never touches coverage
- pinned: a MAX_SLOTS build can still take the champion, but only on a clean sweep

Verification: 247 files / 4465 tests passed (+7), lint clean, depcruise 0 violations,
build exit 0.

## Open question: should score be weight-independent below the cap?

The step function is the last degenerate edge in model C. Options if it plays badly:
carry a partial-credit term so weight pays a little below the cap, or lean in and
make the cap the explicit mechanic it already is. Needs playtest, not arithmetic.

### "Raw" was a fake unit; the model now speaks slots

Marciano, on gate 2 at weight 4 with no multiplier configs: "22.5% per poll. dont
even have coverage configs. How does this work?!"

The UI was contradicting itself in the same screenshot: the ring said `90 raw
divided by weight 4` while the BUILD panel one row down said `0.9 of 4 slots
proven`. Same number. `netRaw` was literally covered slots x 100, and the `/100`
in `coverageRatioOf` existed only to undo a unit nobody chose on purpose.

Worse, it hid the cleanest fact in the model: `bankedScore = min(netRaw/100,
weight)` is just `min(coveredSlots, weight)`. **Score IS covered slots.**

Refactored the whole model into slots. Behaviour is identical: all 55 specs pass
with the SAME expected values (band boundaries, heaviestSurviving, rightsToFill,
rightsToSurvive all unchanged). Float divergence between `0.3 * (gate+1)` and
`30 * (gate+1) / 100` peaks at 4.4e-16, versus a FLOAT_TOLERANCE of 1e-9.

- `BASE_RAW = 30` -> `BASE_SLOTS_COVERED = 0.3`
- `rawPerCorrectAt` -> `slotsPerCorrectAt`, `rawPerMissAt` -> `slotsPerMissAt`
- `netRawAfter` -> `coveredAfter`, `rawToReach` -> `slotsToReach`,
  `rawOwedFor` -> `slotsOwedFor`
- `coverageRatioOf(covered, weight)` is now plainly `covered / weight`
- `bankedScore(covered, weight, streak)` = `min(covered, weight) * streakMult`
- the word "raw" appears zero times in the model and the rig

Slots covered per correct answer, by gate: `0.3 0.6 0.9 1.2 1.5 1.8 2.1 2.4 2.7
3.0 3.3 3.6 3.9`. So his 22.5% was one answer covering 0.9 of his 4 slots.

Verification: 247 files / 4465 tests passed, lint clean, depcruise 0 violations,
build exit 0.

## Todo: model D

- [x] `coverageRatio.model.ts` -- maintenance penalty replaces division by weight; flat gain; loss ladder back under 1.0; victory multiplier
- [x] `coverageRatio.model.spec.ts` -- pin his table, the strictly-rising score gradient, monotone difficulty
- [x] `proto-coverage.tsx` -- coverage is a ratio; restore the shop score delta; state the penalty outright
- [x] Re-run the Monte Carlo against shipped constants (expect 1/19/65% at 70/80/90%, optimum W12)
- [x] Verify: npm test, npm run lint, npm run build

### Model D built

`gain = BASE_GAIN * (1 - MAINTENANCE_PER_SLOT * (weight - BASE_SLOTS))`, flat at
every gate. Weight stops dividing and starts discounting.

Constants: `BASE_GAIN = 0.25`, `MAINTENANCE_PER_SLOT = 0.025`,
`VICTORY_MULTIPLIER = 2`, `LOSS_LADDER` back under 1.0 at
`0 0 0 .1 .15 .2 .25 .3 .35 .4 .45 .5 .5`.

Fixes all three model C faults at once:

1. **Score gradient restored.** Weight no longer cancels: banks go 4.0 / 8.0 /
   12.0 / 14.0 / 15.0 at weights 4 / 8 / 12 / 16 / 24, strictly rising to weight
   20. Every shop offer now moves the number, which is the fault that started this.
2. **The bar is a difficulty dial again.** Nothing grows with the gate any more,
   so the ladder cannot be outrun and the loss-above-1.0 hack is deleted.
3. Division by total weight is gone.

`BASE_GAIN` turned out to be the single tuning knob, and precisely so: in every
sim run **"heaviest build surviving the champion on four of five" equals the
optimal build weight exactly**. 0.25 puts both at weight 12, the midpoint of the
4 to 24 ladder, leaving the top half as territory only config multipliers can
reach. Verified: `heaviestSurviving(4, 5, 12, [agentsMd])` is MAX_SLOTS, so a 2x
config opens the whole ladder.

Monte Carlo against the SHIPPED constants: optimum weight 12 at 80% and 90%
accuracy, win rates 19% and 64%.

**Accepted trade-off, named in the plan:** the optimum no longer moves with
skill. Model C's did (W8 to W12) because its 100% cap bound for light builds;
under a flat gain the cap rarely binds, so the penalty slope alone fixes the
target.

The Monte Carlo is now a PERMANENT seeded regression inside
`coverageRatio.model.spec.ts` (LCG, 2000 trials, 449ms) rather than a throwaway
script. It asserts the design claims directly: a mid build outscores the minimum
one, stops paying once too heavy to prove, safety trades against score, and a
maxed build cannot finish unaided.

Verification: 247 files / 4456 tests passed, lint clean, depcruise 0 violations
across 995 modules, build exit 0.

Still open: config POWER is unmodelled, and model D leans on it harder than C
did, since the whole design rests on configs lifting a build past its unaided
maintenance ceiling.

## Todo: model E

Marciano's simplification: weight leaves the coverage formula entirely. Coverage is
accuracy x configs x gate. Weight becomes capacity, bought with KB, and pays in score.

- [x] `coverageRatio.model.ts` -- delete the maintenance penalty; gain is weight-free; add multiplierToSurvive/ToClear
- [x] `coverageRatio.model.spec.ts` -- pin the unaided wall at gate 8 and the multiplier ladder; keep the seeded balance sim
- [x] `proto-coverage.tsx` -- hold a real Build; buy capacity on SLOT_PRICES_KB; block installs that do not fit
- [x] Verify: npm test, npm run lint, npm run build

### Model E built

Marciano's simplification. Weight leaves the coverage formula entirely:

```
gain per correct = BASE_GAIN * product(config coverageMultipliers)
```

`BASE_GAIN = 0.125`, flat at every gate, weight-free. Coverage is now
accuracy x configs x gate, nothing else. Weight becomes capacity, bought with KB,
and pays only in score (`coverage * weight * streak`).

**The wall, which is the point.** An unaided build clears gates 0-6 comfortably,
needs four of five at gate 7, five of five at gates 8-10, and CANNOT clear gates
11 or 12 at any answer count. Multipliers are the only way through, and
`multiplierToSurvive(gate, rights, polls)` names the price: free until gate 8,
x1.10 at gate 8, x1.60 at the champion. The roster carries x1.5 (Intellisense),
x2 (AGENTS.md) and x3 (Deprecated), so one good config opens the late run and
stacking opens it comfortably.

**What stops "buy everything".** Capacity is now a purchase on the existing
`SLOT_PRICES_KB` ladder and configs need a free slot, so KB genuinely splits.
Reused `build.model.ts` wholesale rather than inventing anything: the rig holds a
real `Build` and calls `hasRoomFor` and `occupiedSlots`.

The economy lands well without tuning. Multiplier configs are LARGE rather than
expensive (Intellisense 4 slots, AGENTS.md 8), and capacity is the costly half:
capacity 12 costs 640 KB cumulative, capacity 24 costs 11,056 KB against 3,328 KB
earned in a whole run. So the real price of a multiplier is the capacity it eats,
and maxing out is unreachable in one run, keeping capacity a live sink for all 13
gates.

The seeded balance sim was rewritten to vary LOADOUTS instead of weights, since
weight no longer touches survival. It asserts a bare build never reaches the
champion, that each added multiplier gets strictly deeper, that accuracy still
matters once multipliers are there, and that stacking cannot brute force poor
accuracy.

Verification: 247 files / 4445 tests passed, lint clean, depcruise 0 violations
across 995 modules, build exit 0.

**Known gap, now load-bearing.** In the rig a multiplier config is strictly better
than a same-size config without one, because non-multiplier effects are still
unmodelled. So "which config" collapses to "prefer multipliers" and only "capacity
vs config" is a real choice. Wiring a second config axis is the next experiment.

### Category matching wired (the config axis that was missing)

Marciano: "How come its STILL 12.5 even if i have .js and answered a js poll while
a git poll gives me the exact same?!"

Correct, and it was the gap flagged three times as "config power is unmodelled",
now identified specifically. `.js` declares `focusCategory: "js"` and its own
description promises "JS polls pay 1.25x coverage", but the proto's
`coverageMultiplierOf` only read `coverageMultiplier` and ignored the category
entirely. Originally scoped out ("Out of scope: per-config coverage allocation and
category matching") but the model moved on and focus IS the main config axis.

Reused the real engine's implementation rather than inventing one:
`focusMultiplierOf` in `config.model.ts` (`1 + 0.25 * level`, so 1.25x at level 1),
applied the way `effect.model.ts:66` already does it.

- `coverageMultiplierFor(configs, category?)` is now the real function;
  `coverageMultiplierOf(configs)` is the unmatched baseline the gate maths uses
- `focusBonusFor(configs, category)` names what a matching poll is worth
- `gainPerCorrectFor` / `gainPerMissFor` / `coverageAfter` all take an optional category
- the rig scores each answer against the poll it was actually given, shows a
  `MATCHED x1.25` badge on the category chip, and lists what the build is focused on

What a poll is worth now: 12.5% unmatched, 15.6% matched, 31.3% matched with a 2x
stacked on top. Across a gate of five matched polls that is 78.1% versus 62.5%,
which is the difference between clearing gate 9 and dying there.

Verification: 247 files / 4452 tests passed (+7 focus specs), lint clean, depcruise
0 violations across 995 modules, build exit 0.

This closes the "prefer multipliers" collapse: a focus config and a flat multiplier
now do different jobs, so "which config" is finally a real question. What is still
unmodelled is every NON-coverage effect (elimination, prefetch, telemetry).

### The abstract score is deleted; a gate pays KB

Marciano, on the shop badge: "bank what?"

Fair. `bankedScore` was a number I invented with no unit and nothing that spent
it. Checking `gateClearPayout` in `build.model.ts` showed the game already had the
answer: a cleared gate pays **KB**, and there is no abstract score anywhere in the
run domain. Structurally obvious in hindsight, **coverage already IS the score** --
it is the number you beat the gate with, the way chips x mult beats a blind. KB is
the money. A third currency between them did nothing.

His call: "the more coverage u score the better your gate reward (kb)", with the
reward scaled by build size so the 100% cap does not ceiling your income.

```
gate payout = 32 KB x proven slots (coverage x weight) x streakMultiplier
```

Replaces the flat 256 KB a gate, which was why weight felt disconnected from the
economy: income used to be identical whatever you built.

| | weight 4 | weight 12 | weight 24 |
|---|---|---|---|
| covered 100% | 128 KB | 384 KB | 768 KB |
| covered 60% | 77 KB | 230 KB | 461 KB |

Over a full run: a weight-4 build capping every gate earns 1664 KB, a weight-12
build capping earns 4992 KB, and a weight-12 build at 60% earns 2995 KB. Capacity
4 to 12 costs 640 KB cumulative, so the loop closes properly: cover more, earn
more, buy more capacity, cover more.

Deleted with it: `bankedScore`, `finalScore`, `VICTORY_MULTIPLIER` and the `score`
state. Winning is now simply winning; there is no score to double, and no reason to
prefer dying deep. The rig tracks `earnedKb` as a run summary instead.

Also fixed this round, both found by him reading badges:
- the shop survival badge had its COLOURS INVERTED. It was written for model D
  where buying cost survival, so "demand changed" meant worse and was painted red.
  Under model E a config can only ever improve the demand, so every good purchase
  was red and every useless one green. The "worse" branch was unreachable.
- two lines still claimed "every answer is worth the same", which stopped being
  true the moment focus matching landed an hour earlier.

Verification: 247 files / 4453 tests passed, lint clean, depcruise 0 violations,
build exit 0.

## Model F: 5% base, 8% multiple choice

Marciano: "I want to base score to be 5% per poll. and for multiple choice a max of 8%."

- [x] SINGLE_GAIN 0.05 / MULTIPLE_GAIN 0.08 / baseGainFor / coverageDeltaFor
- [x] Payout against the gate's line, PAYOUT_RATIO_CAP 1.5
- [x] Rig polls become real RunPolls, graded by coverageShare
- [x] Multi-select answering UI via Button's pressed prop
- [x] Spec rebase, incl. a winnable loadout for the Monte Carlo

Decisions: HEALTHY_LADDER unchanged (multipliers mandatory from gate 3);
payout = min(1.5, coverage/healthyLine) * weight * 32 * streak; only full marks
advance the streak.

### Model F built, 2026-09-12

Verified: 247 files / 4462 tests pass, lint clean, depcruise 0 violations
(995 modules), build exit 0. Shipped constants reproduce the planned tables.

What the run became, straight from the code:

```
gate  HEALTHY  floor   5of5    4of5  | bare survives on
   0      5%    0%   x0.20  x0.25   |        0
   2     20%    0%   x0.80  x1.00   |        0
   3     30%    5%   x1.20  x1.54   |        2
   5     50%   25%   x2.00  x2.63   |        5
   6     60%   35%   x2.40  x3.20   |    never
   8     75%   50%   x3.00  x4.11   |    never
  12     95%   70%   x3.80  x5.43   |    never
```

A bare build survives gates 0-5 and dies at 6. Meeting the line pays 384 KB at
weight 12 at every gate, 0 through 11 alike. Roster multipliers: Intellisense
x1.5, AGENTS.md x2, Deprecated x3 (decaying), stacking to x9 on 16 slots.

Notes for the next pass:
- `indexedDb` has NO coverageMultiplier despite its description; the x3 is
  `CONFIGS.deprecated`. The spec pinning `coverageMultiplierOf([yarnLock,
  indexedDb]) === 1` is what caught it.
- The rig's polls are now real `RunPoll`s graded by the engine's `coverageShare`,
  so the proto and the engine cannot drift on partial credit.

## Proposed: rebase the band ladder (documented, not built)

Marciano, with `SINGLE_GAIN` at 5%: "I'd try this ladder."

| Gate | HEALTHY | OK | SHAKY | DANGER |
|---|---|---|---|---|
| 0 | 5%+ | 0-4% | - | - |
| 1 | 10%+ | 0-9% | - | - |
| 2 | 15%+ | 5-14% | 0-4% | - |
| 3 | 20%+ | 10-19% | 0-9% | - |
| 4 | 25%+ | 15-24% | 5-14% | <5% |
| 5 | 30%+ | 20-29% | 10-19% | <10% |
| 6 | 40%+ | 30-39% | 20-29% | <20% |
| 7 | 50%+ | 40-49% | 30-39% | <30% |
| 8 | 60%+ | 50-59% | 40-49% | <40% |
| 9 | 70%+ | 60-69% | 50-59% | <50% |
| 10 | 80%+ | 70-79% | 60-69% | <60% |
| 11 | 90%+ | 80-89% | 70-79% | <70% |
| 12 | 95%+ | 85-94% | 75-84% | <75% |

### It is three constants, nothing structural

- `HEALTHY_LADDER` `.05 .10 .15 .20 .25 .30 .40 .50 .60 .70 .80 .90 .95`
  (today `.05 .10 .20 .30 .40 .50 .60 .70 .75 .80 .85 .90 .95`)
- `OK_DROP` 0.15 -> 0.10
- `SHAKY_DROP` 0.25 -> 0.20

The drops stay uniform and keep clamping at zero, and that clamp is what empties the
SHAKY column at gates 0-1 and the DANGER column at gates 0-3. Verified: those three
values reproduce his table cell for cell, so `okAt`/`floorAt`/`bandFor` need no new
shape.

### Every band becomes exactly two correct answers wide

At 5% a correct poll, a 10 point band is 2 rights. Today OK is 15 points (3 rights)
and SHAKY is 10 (2), so the ruler is uneven for no reason. Under the proposal both
are 10 and the whole readout is legible in answers rather than percent: one band is
two answers, one early gate step is one answer, one late gate step is two.

### The slope moves from the front half to the back half

Difficulty index, healthy line divided by 25% (all a bare build can earn on 5 of 5):

```
gate   :  0    1    2    3    4    5    6    7    8    9   10   11   12
new    : .20  .40  .60  .80 1.00 1.20 1.60 2.00 2.40 2.80 3.20 3.60 3.80
current: .20  .40  .80 1.20 1.60 2.00 2.40 2.80 3.00 3.20 3.40 3.60 3.80
```

The current ladder spends its whole slope by gate 5 and then crawls, +1.8 across the
last seven gates. The proposal climbs +0.2 a gate to gate 5 and +0.4 a gate after, so
gates 6-12 carry the difficulty instead of gates 2-5. Same endpoint (3.8 at the
champion), different shape.

This is the "late gates were not harder" playtest complaint again, answered from the
other side: model D steepened the miss cost past 1.0 to fix it, this flattens the
early demand instead.

### What the run becomes

Bare build, no multipliers, 5 polls a gate:

| | current | proposed |
|---|---|---|
| last gate a bare build survives | 5, on 5 of 5 | 6, on 5 of 5 |
| last gate a bare build meets the line | 2 | 4, on 5 of 5 |
| first gate needing a multiplier to survive on 4 of 5 | 5 (x1.32) | 6 (x1.07) |
| multiplier to meet the line on 4 of 5 at gate 3 | x1.54 | x1.03 |
| floor at gates 11 / 12 | 65% / 70% | 70% / 75% |

Gates 2 through 10 all get easier. Gates 11 and 12 get HARDER on survival, since the
floor rises 5 points while their healthy lines stay put. The crossover is gate 10.

Caveat: closed form only, no Monte Carlo behind it yet.

### Specs that move if this is built

- `rightsToSurvive(5, 5, BARE)` 5 -> 3 and `(6, 5, BARE)` undefined -> 5 (spec 233-234)
- `multiplierToSurvive(8, PACE, 5)` 2.74 -> 2.19, `(LATE, PACE, 5)` 4.00 -> 4.29 (spec 247-248)
- the band ruler pin (spec 323-326): `bandFor(0.5, gate)` at gates 6 / 8 / 9 each moves up
  one band, ok -> healthy, shaky -> ok, danger -> shaky
- the seeded Monte Carlo needs re-running; win rates shift both ways, up in the mid
  gates and down at the champion

## Settled 2026-09-12 (DVTD-nd6r): the rebase is the model

Marciano restated the model in one block and the band-ladder rebase above is
part of it, so it stops being a proposal. Three constants move, no new shape:

- `HEALTHY_LADDER` -> `.05 .10 .15 .20 .25 .30 .40 .50 .60 .70 .80 .90 .95`
- `OK_DROP` 0.15 -> 0.10
- `SHAKY_DROP` 0.25 -> 0.20

Recorded as ADR-073 (the gain is flat, the HEALTHY line is the only difficulty
dial) and ADR-074 (weight bills KB every gate; there is no slot ladder).

**What that changes in this rig.** Model E gave the rig a real Build that buys
capacity on `SLOT_PRICES_KB` and blocks installs that do not fit. Both rules go:
capacity is soft, and weight is charged instead of bought, at 4 -> 0, 6 -> 16,
8 -> 32, 12 -> 64, 16 -> 128 KB per gate. The rig is where that curve gets felt
before it is priced, which is exactly what this bean exists for. Note that
weight already scales `gatePayoutKb`, so the rig will show a heavy build earning
more and costing more at the same time; whether that crosses over anywhere
useful is the thing to look at.

**And what a gate does.** `survivesGate` still answers with one boolean.
ADR-071: only HEALTHY advances, OK and SHAKY repeat the same gate on five fresh
polls, DANGER ends the run, nothing peels on a miss. DVTD-7uil owns the wiring;
the rig needs it to show the repeat at all.

## Todo: the rebase and the upkeep curve

- [x] `coverageRatio.model.ts` -- rebase `HEALTHY_LADDER`, `OK_DROP` 0.10, `SHAKY_DROP` 0.20 (DVTD-1zzz, 2026-09-13)
- [x] `coverageRatio.model.spec.ts` -- pins moved; the seeded sim needed no change, its assertions are properties (DVTD-1zzz, 2026-09-13)
- [ ] `coverageRatio.model.ts` -- add the weight upkeep curve; decide interpolate or step between the given rungs
- [ ] `proto-coverage.tsx` -- drop the capacity purchase and the does-it-fit install block; charge upkeep at every gate close
- [ ] `proto-coverage.tsx` -- peel configs when the upkeep is unpayable (ADR-074 decision 4)
- [ ] Re-run the Monte Carlo: the rebase alone moves the bare-build death from gate 6 to 7 and the crossover to gate 10, and upkeep has never been in a sim
- [ ] Verify: npm test, npm run lint, npm run build

## Reasons for Scrapping

Scrapped 2026-09-16: the rig this bean's remaining work targets was deleted, and
one of its todos has since been reversed by an ADR.

**The file is gone.** `src/routes/proto-coverage.tsx` was added in `3b433245` and
deleted in `f15ccf17` — the same commit that ticked the two rebase todos. Its
siblings `proto-run.tsx` and `proto-session-slice.tsx` survive; only the coverage
rig went. So the three `proto-coverage.tsx` todos are unexecutable as written.

**The work landed in the real engine instead.** `BUILD_SPACE_RUNGS`
(`rules.model.ts:14`) is exactly the 4→0, 6→16, 8→32, 12→64, 16→128 curve this
bean quotes, and the "interpolate or step" question is answered as **step** by
`rungIndexForSpace`/`upkeepForSpace` (`rules.model.ts:36`), pinned at
`rules.model.spec.ts:189` (`upkeepForSpace(9) === 32`, `(11) === 32`, `(12) === 64`).
Upkeep is charged at gate close by `settleUpkeep` inside `closeWindow`
(`answer.model.ts:90` and `:243`). The slot purchase the bean wanted dropped is
already gone: `SLOT_PRICES_KB`, `startSlot.model` and `slotsBought` have zero
hits in `src/`.

**The peel todo is reversed, not merely done elsewhere.** ADR-082 Decision 4
replaced ADR-074 Decision 4: an unpayable bill drops to the highest affordable
rung and is never fatal, because rung 4 is free. "A peel cannot settle a bill
charged for reserved room." Working this todo as written would reintroduce a
reversed decision. ADR-082 Decision 3 likewise reverses "drop the does-it-fit
install block": the rung is a hard cap and the shop door holds you to it.

**The one live concern moves.** Upkeep has still never been in a Monte Carlo.
ADR-082 closes by saying the curve is hand-set and **DVTD-8gns** owns the real
shape, so that is where it belongs.

**Residue cleaned with this scrapping:** `.dependency-cruiser.cjs` still
whitelisted the deleted `proto-coverage` route in `DEV_RIG_ROUTES`; the
alternation is now `^src/routes/proto-(run|session-slice)\.tsx$`.
