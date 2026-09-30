# ADR-157: A gate asks the window for a minimum, then asks the bands

## Status

Accepted — 2026-09-29 (Marciano, DVTD-euw1). Supersedes the `FLOOR_CORRECT`
half of [ADR-076](076-the-closing-band-decides-what-it-costs.md); the band
ladder in that ADR is untouched. Built the same day.

## Context

A gate closed on a HEALTHY meter and held anyway. Both halves were correct and
neither was on screen.

Coverage carries: the meter reads `bankedUnits + window.unitsEarned`, and a
wrong answer subtracts nothing. A window that landed none of its five therefore
closed on the previous gate's cushion, above the line. `FLOOR_CORRECT = 2` held
it, and nothing before the gate said such a rule existed.

The rule was also blind to partials. A window of four three-quarter partials
counted zero right answers and held exactly as hard as five blanks, which
contradicts paying a partial a quarter at a time
([ADR-079](079-a-partial-answer-pays-a-quarter-at-a-time.md)).

Two unrelated rules shared the word *floor*: the right-answer count, and
`floorAt(gate)`, the survival line under SHAKY. A doc that said "the floor"
was ambiguous.

## Decision

### 1. A gate clears only when the window itself scored a minimum

`gateRulingFor` runs two independent tests in the order it already used: DANGER
ends the run, then the window's minimum, then the band. A window under the
minimum is **held**, whatever the meter reads, with `heldBy: "unscored"`.

`MIN_WINDOW_UNITS = 2`. Partials count toward it, so three three-quarter
partials clear a minimum that five of them used to fail.

`FLOOR_CORRECT` and `meetsGateFloor` are deleted. `floorAt(gate)` is now the
only floor in the game.

### 2. The minimum is counted before the build touches it

The window accumulates `baseUnits`: the raw share each answer was worth, with no
config multiplier, no flat add, no streak step and no multiple-choice credit.

It lives on `GateWindow` beside `correct` and `unitsEarned` — the other two numbers
the close reads — because `freshWindow` resets all three at the window boundary and
they therefore cannot drift. The raw share also survives on each answer record, so
`answeredThisGate` could be summed instead; that works, but it makes the close
depend on the shop exit having cleared the list rather than on the window's own
lifetime.

This is what makes the rule a rule. Units as scored are inflated by the build, so
a threshold on them is a threshold divided by your multiplier. A simulation of
the earlier `unitsThisGate > 0` draft measured the cost: a build holding one
doubler went from a 30.6% win rate at p=0.6 to 87.7%, because a single correct
answer earned enough inflated units to clear both tests. Bare builds barely
moved. The entire mid-game difficulty of a multiplied build lived in that second
required answer.

The multiple-choice credit is deliberately excluded. `creditFor(multiple) = 2`
exists so a harder poll **pays** more ([ADR-081](081-a-multiple-choice-answer-pays-double.md));
letting it also satisfy a minimum-effort test would mean one answer clears the
whole rule.

### 3. Both tests are stated before the window and after it

The stakes panel carries a third objective beside the clearing band and the
swatch, and the standing line runs the live figure while the window is open.

On the debrief the meter keeps its **honest** reading. It is not lying: the run
really does stand where it stands, and the gate held because the window added
nothing. The reason rides beside the band as its own badge. The screen no longer
derives the band itself ([ADR-010](010-ui-layer-separation.md)); the viewmodel
supplies the meter reading and the outcome band separately, because they answer
different questions and a caught run needs the second one.

An unscored hold states no coverage shortfall, because there is none.

## Consequences

The thinnest clear still pays 20% of the payout row rather than 40%: a window can
now clear on partials alone, and `gateClearPayout` scales on exact-correct
answers. A gate that clears and pays nothing is new, and coherent with coverage
being the score and storage the reward.

`baseUnits` is net of the `strict` wager, so a correct answer cancelled by armed
losses reads as an unscored window and holds ([ADR-089](089-an-armed-wager-pays-or-bills-one-answer.md)).

Planning Poker cannot rescue a blank window: its units join the close, but a met
bet needs at least one right answer.

Dry Run models both tests. It previously modelled neither, so it would have
repeated the exact misprediction this ADR exists to stop.

Runs persisted before this change hydrate `baseUnits` from the window's
right-answer count, which under-counts partials in a window already in progress
and never over-counts.
