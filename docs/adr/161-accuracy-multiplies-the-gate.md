# ADR-161: Accuracy multiplies the gate, and each gate asks its own demand

## Status

Accepted — 2026-09-30 (Marciano, DVTD-emp3). Built the same day. Supersedes the cumulative meter of
[ADR-094](094-the-bands-are-cut-in-answers-and-widen-with-the-climb.md)
(Decisions 1 and 3: rungs in codebase units, the floor is yesterday's HEALTHY).
Supersedes the window minimum of [ADR-157](157-a-gate-asks-the-window-for-a-minimum.md) (§6)
and the Champion rule of [ADR-159](159-the-champion-takes-no-thin-clear.md).

## Context

Each poll pays `credit × matching config multipliers + flat`, and a window sums
its polls. Knowledge counts once, the build counts on every poll. At the
Champion a bare build answering 5 of 5 read 16%, a ×6.75 build answering 3 of 5
read 63%.

The meter is also clamped at a full codebase, so a gate can never ask more than
5 units of a window. A balance run showed any multiplier on top of that only
turns into KB: an accuracy bonus made a bare build play exactly like a doubler
and gave the doubler nothing.

## Decision

### 1. Accuracy multiplies the gate's output

```
gate output = (Σ poll outputs) × 2 ^ (accuracy earned / accuracy available)
```

Each poll offers its credit as accuracy: a single offers 1, a multiple 2 (under
207 every poll is credited, and so weighed, as a single). It earns its share: a
single 0 or 1, a multiple 0, 0.5, 1, 1.5 or 2.

| the window offers | 5 singles | 4 + 1 multiple | 3 + 2 | 5 multiples |
|---|---|---|---|---|
| available | 5 | 6 | 7 | 10 |
| one full unit | ×1.149 | ×1.122 | ×1.104 | ×1.072 |
| a perfect window | ×2 | ×2 | ×2 | ×2 |

A window that earns 5 of 7 reads ×1.64. A multiple pays up to two output but
also adds two to what is available, so the ceiling never moves past ×2: a
multiple is a bigger share of the bar, not a bigger bar. Order does not matter.
The exact formula is used, never rounded steps.

Amended 2026-10-01: the first version weighed every poll as one segment. Weighing
by credit makes a hard multiple count for what it is, without raising the top.

**The mix stays hidden until it is known.** The available figure depends on how
many polls take more than one answer, which Prefetch v2 and `git rebase -i` v2
sell. So the poll screen states the multiplier only as a range it can promise: the
multiplier sure if every poll still ahead is a missed multiple, up to the one every
poll right would reach (amended 2026-10-02, ADR-170's one bar). Neither reading
uses the sealed mix. For the same reason the live coverage bar reads the **guaranteed floor**: poll output
times the multiplier it would earn if every poll still ahead were missed, counting
each unseen poll as a multiple until the mix is known. It only rises, and on the
fifth answer it is what the close pays. (Amended 2026-10-02: the bar first read
output before the multiplier, so a perfect window read 56% and jumped to 100% at
the close.) Dry Run promises
a clear only if it holds with every unseen poll a missed multiple.

### 2. No config touches the multiplier

Configs change poll output only. A config that bends the accuracy step would
stack a second multiplier on the first, and the question would become "how do I
exploit this" instead of "do I know the answer".

### 3. Each gate asks its own demand

Coverage is `gate output ÷ gate codebase`, per gate. The codebase ramps from
9 changes at Pallet to 11 at the Champion (amended in §6). Coverage caps at 100%.

Overshoot pays 16 KB for every full bar past the codebase (`KB_PER_EXTRA_BAR`),
the same at every gate. The old 32 KB per unit would have paid 224 KB for a bare
perfect window at Pallet and 864 KB for a ×3 one, against a clear of about 61 KB.

### 4. The bands are forgiving early and hard late

Lines as a share of the gate's demand, interpolated linearly from Pallet to
Elite:

| gate | DANGER under | SHAKY | OK | HEALTHY |
|---|---|---|---|---|
| Pallet | — | 0–20% | 20–40% | 40–100% |
| Soul (6) | 33% | 33–47% | 47–62% | 62–100% |
| Elite (11) | 60% | 60–70% | 70–80% | 80–100% |
| Champion | 65% | 65–74% | 74–84% | 84–100% |

PERFECT is 100%. What each band does at the close is unchanged (ADR-076,
ADR-159).

### 5. A small head start carries

10% of a gate's overshoot opens the next gate as output (`headStartUnits` on the
run, renamed from `bankedUnits`, which no longer banks). Nothing else carries.
Capped at the next gate's floor by §6.

## Rejected

- A share of the window's own ceiling: a known top turns the gate into a checklist.
- A flat "N of 5" per gate: static, blind to configs, multiples and streak.
- A product of per-poll factors: kept the sum, which lets each poll trigger its
  own part of the build.
- Cash out, a universal answer order, configs bending the step: together too
  much like a casino combo system. Answer order stays `git rebase -i`'s identity.
- "I'm sure" for every answer: calibration is worth testing, but as one optional
  config, not a rule.
- A cumulative ledger (every gate opens five changes, covered clamped at opened,
  credit repairs earlier debt): its 100% clamp over the whole run is what cancelled
  any multiplier, and the dilution shrinks each gate (5/10 down to 5/65), so late
  gates get easier to keep. Its vocabulary was kept: the meter speaks in changes
  covered, not units and slots.

## Consequences

Balance, simulated (4000 runs; DANGER and a failed window minimum end the run,
SHAKY holds up to two retries). Superseded by §6's engine figures:

| win rate | p=0.6 | p=0.7 | p=0.8 | p=0.9 |
|---|---|---|---|---|
| bare | .00 | .01 | .10 | .45 |
| ×2 build | .13 | .44 | .81 | .98 |
| ×3 build | .29 | .67 | .91 | .99 |
| ×9 build | .31 | .66 | .91 | .99 |
| bare, a quarter multiples | .01 | .07 | .34 | .75 |
| bare, half multiples | .03 | .22 | .58 | .89 |

- Knowledge alone can win, a build makes it likely.
- A snapshot written under the cumulative meter hydrates with no head start. Its
  old bank would fill a per-gate codebase on its own and PERFECT the next gate.
- A run's lifetime units (the Dex history, the climb map, player cards) read over
  the sum of every codebase the run played (`runShareOf`), since no single gate's
  codebase measures them any more.
- A close recorded without its held reading fills it from its band's line.
- Prep's Scoring fold no longer says the codebase grows five slots a gate; it
  states the multiplier instead.
- Player copy counts **changes**: "You have covered 1.15 of 3 changes", "+1.3 changes
  to SHAKY", "Boulder ships 5 changes". Internals keep `units` and `scoringSlotsAt`.

## 6. Coverage alone decides (2026-10-01, DVTD-x5jr)

Playtesting found two faults. PERFECT landed at 3 of 5 on gates 0 to 3, because
Pallet shipped 3 changes, so the last polls carried no tension. And the window
minimum read as a flat "2 right" on every gate: a rule no config can touch,
which stopped binding by mid-run while the real, rising demand stayed hidden in
percentages.

- **The window minimum is removed.** A gate closes on its band alone. A close
  recorded under the old rule keeps `heldBy: "unscored"` and reads "the window
  came up short"; nothing produces it any more.
- **A head start is capped at the next gate's floor**, so it reads SHAKY at most
  and can never clear a gate by itself. This is what the minimum used to guard.
- **The early gates ship 9 changes** (codebase 9, 9, 9, 9, 9, 10, 10, 10, 10, 11,
  11, 11, 11). A first cut of 5 at Pallet still let any build fill the bar early: on
  a pool spread over five categories a lean build's focus configs and the streak
  made three right reach PERFECT, and a ×3 build reached it on two. At 9 a lean
  build needs four right and a multiplier build three.
- **The balance guard runs the real engine.** `runAction.model.spec.ts` plays whole
  runs through the reducer, so decay, rent and the peel count. Its two abstract
  predecessors in `coverageRatio.model.spec.ts` ("stops paying for multiplier",
  "cannot be brute forced by stacking") are deleted: without those costs they
  measured a ×9 build that does not exist (96% at 60% accuracy there, 53% in the
  engine).

Engine win rates (300 runs a cell, polls spread over five categories, a build
installed from the start, shop skipped), against the "knowledge first" target:

| build | accuracy | target | engine |
|---|---|---|---|
| lean (four focus configs) | .6 / .8 / .9 | .00 / .15 / .50 | .00 / .19 / .67 |
| ×2 (AGENTS.md) | .6 / .7 / .8 | .10 / .35 / .70 | .10 / .37 / .69 |
| ×3 (+ Intellisense) | .6 / .7 | .25 / .55 | .43 / .71 |

Share of gate 0-3 closes that reach PERFECT on three right or fewer: lean 0%, ×2
31%, ×3 35% (it was 27%, 52% and 62% with Pallet at 5). Builds clearly matter, and
stacking stops paying where decay and rent take it back. A ×3 build stays stronger
than the target; accepted, because the only lever that closes that gap is a rule
counted in right answers, which this section removes on purpose.

**The gate result states the multiplier.** Each close records its accuracy tally,
and the result's coverage rows read "covered 3.95 ×1.52" beside "3 of 5 right"; the
storage fold's headline is the balance change, bills taken off.

**Prep states the gate in plain numbers** (2026-10-01, after an outside review of
the At stake card). Band rows read from their lower line ("25%+"), the standing
line reads "Cover 1.1 more changes to reach HEALTHY", Scoring states a change in
points and lists the whole multiplier curve, and the KB quote for each band counts
the multiplier. The review's "5 polls = 5 changes" was rejected: it is the Pallet-at-5
codebase this section already measured, where PERFECT landed at three right.

**A poll can be skipped** ([ADR-169](169-a-poll-can-be-skipped-and-speed-is-a-config.md)):
a skip is left out of the multiplier, and a streak no longer adds coverage.

**From here on only numbers change** (the codebase, the lines, the multiplier's
ceiling), not mechanics, and only on playtest evidence.

Rejected in the same loop:

- A run-memory meter (coverage carried across gates, overshoot repaying debt). In
  the sim a ×2 build won 98% at 60% accuracy, or ×3 won 95% with a split rule; it
  cannot be tight without a per-window death check, which brings back the feeling
  of dying "despite coverage".
- A rising right-answer minimum (2, then 3, then 4). It hit the target, but it is a
  count no config can help with.
- Gate strictness scaled by build weight. Weight already costs rent, peel and
  audits; it invites selling configs before prep to lower the line, and makes
  upgrades feel like level scaling.
