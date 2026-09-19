# ADR-089: An armed wager pays or bills one answer

## Status

Accepted, 2026-09-16 (Marciano, DVTD-1gic). Reverses
[ADR-073](073-coverage-is-a-flat-unit-over-a-growing-denominator.md)'s "a wrong
answer subtracts nothing", scoped to one config: the meter still has no loss
term of its own, and only an armed wager can move it down. Sits beside
[ADR-085](085-a-prep-time-bet-pays-coverage-on-a-floor.md) as the second wager
on the roster, and inside
[ADR-083](083-a-coverage-config-multiplies-or-adds-units.md) as an add.

## Context

Three configs sell a press during a poll: ESLint rules an option out, Telemetry
reads the community, A/B Test ships the other arm. All three buy information or
a stance. None of them puts anything at risk, so none of them asks the player to
rate their own confidence.

Planning Poker is the roster's only wager and it is prep-time, per gate, and
free of downside. DVTD-6ce4 named the flaw precisely: "the bet has risk but no
loss, so the decision is an EV lookup rather than a choice." A bet you cannot
lose is arithmetic, and the optimal play can be computed once and reused every
gate.

ADR-073 removed the loss *rule* but left every *mechanism* standing.
`AnswerLedger.coverageLoss`, `AnsweredPoll.coverageLost` and the subtraction in
`applyAnswer` are live code fed a literal zero, and `PollView.component.tsx`
renders a "wrong costs" badge that `perAnswerPreviewFor` starves by hardcoding
`coveragePerWrong: 0`. The wiring for a per-answer cost has been sitting unused
for four ADRs.

`strict: true` is the tsconfig option that refuses to let anything slide. It is
the obvious dev-world name for exact-or-nothing (ADR-042 pillar 4).

## Decision

1. **`strict: true` is a per-poll toggle, armed before the answer.** The press
   rides the config chip in the sticky build footer, so it is reachable on every
   poll without competing with the answers for space. A single-answer poll
   commits on the pick and has no footer (ADR-084), which is exactly why the
   wager cannot be a second stage of the answer press: it has to be its own
   control, armed first.

2. **An exact answer pays +0.5 units; a partial, a miss or a timeout costs
   0.5.** One stake, one magnitude, both directions. On a single-answer poll
   that is a 50% swing on the base unit; on a select-all, where the credit is
   two (ADR-081), it is 25%. The wager is therefore worth proportionally more on
   the poll type whose outcome is easiest to read.

3. **The cost lands on `window.unitsEarned`, not only on lifetime coverage.**
   `applyAnswer` already subtracted `coverageLoss` from `coverageByCategory` and
   the run-long `coverage`, but the window, which is what `gateClosingFor` reads
   to decide clear, hold or death (ADR-076), ignored it. A penalty that skips
   the window is a cost the player can feel but never lose to, which is not a
   wager. Adding the loss term there is the one change this ADR makes to shared
   scoring code.

4. **The window clamps at zero rather than going negative.** A gate cannot owe
   units it never earned. This partially refunds a wager lost early in a window,
   and that asymmetry is accepted: the alternative is a negative meter that
   `bandFor` has no rung for.

5. **A partial is billed, diverging from the streak rule.** `nextStreak` holds a
   streak through a partial, and `.prettierrc` exists to pay one (ADR-086).
   Strict charges it anyway, because a config named for a compiler flag that
   rejects "nearly" cannot itself accept "nearly". It also keeps the wager
   genuinely risky on select-all polls, where a partial is the likeliest
   outcome. A timeout already grades as `wrong` (ADR-039), so it needs no rule
   of its own.

6. **The bonus is a flat add, never multiplied.** It is summed after the build
   the way `streakUnitBonus` is, for the reason `rules.model.ts` already states:
   inside the stack a ×6 build would turn +0.5 into +3 and the wager would stop
   rewarding confidence and start rewarding build size. The bill is flat for the
   same reason in reverse: a big build must not make a lost wager cheap.

7. **The wager disarms after every answer.** `applyAnswer` clears it beside
   `manualDisabled: []`. A wager that persisted would decay into a passive
   build-wide stance, and a forgotten arm would punish inattention rather than
   misjudgement. The cost is one press per poll the player wants it on, which is
   the decision itself rather than friction around it.

8. **The settlement lives outside `coverageForAnswer`.** That function opens
   with `if (share <= 0) return 0`, so a miss exits before any config is
   consulted and the bill could never be computed there. It is also
   outcome-dependent, while `Effect.coverage` compiles from an `AnswerContext`
   that carries no outcome. `strictSettlementFor` is called from `scoreAnswer`,
   which already holds both the grade and the state. For the same reason
   `wagersAnswer` is deliberately **not** added to `touchesCoverage`: it is not a
   per-share coverage effect.

9. **The stake is a number on the config, not a boolean.** One tunable constant
   rather than a magic 0.5 in the scorer, and `wagererFor` joins `linterFor` and
   `peekerFor` as a capability finder so "who owns this" is asked in one place.
   Two wagering configs would collide, as `strictStakeOf` takes the first; there
   is one, and the field shape says so.

10. **The chip states the stake before, the receipt states the settlement
    after.** The badge reads `arm ±0.5`, then `armed ±0.5` on the armed rung
    (`aria-pressed`, `press-theme-armed`). A won wager appears as its own row in
    `configBonuses`, so the chip flashes credited like any other payer
    (ADR-084). A lost one appears as a `wager lost` row on the receipt, read off
    `coverageLost`, and comes off the total. The header's dormant "wrong costs"
    badge lights up for the first time while the wager is armed.

11. **A staged reveal refuses the press.** Answering advances `currentIndex`
    server-side while the client still shows the receipt, so a press read from a
    reveal would arm the *next* poll. The badge says `wagered on this answer`
    instead, per the existing rule that a refusal wears its reason as the label
    because `hint` reaches the DOM only as an aria-label.

12. **One slot, earned on 50 correct answers, not upgradable.** One slot matches
    Planning Poker: the real cost is the risk, not the space. Fifty correct
    answers is late enough that a player can read their own confidence before
    being handed a config that can kill them. It stays out of `isUpgradable`
    because a confidence wager with a growing stake would drift toward a flat
    multiplier on skill, and the decision is meant to be the same size every
    time.

## Consequences

This is the first config whose expected value depends on the player rather than
on the build. A player who arms it only when certain profits; one who arms it
every poll is buying variance at their own hit rate, and below 50% accuracy it
is strictly negative. That is the intent: it is the first roster entry that
cannot be evaluated by reading the number on the chip.

It is also the first config that can end a run it did not start. A window sitting
one unit above the SHAKY line can be pushed under it by two lost wagers, and
DANGER ends the run (ADR-076). The clamp at zero means the wager cannot dig a
window below empty, so the worst case is a window that earns nothing rather than
one that owes.

**`ScoringRule` is not parameterised**, for ADR-086's reason: the panel states
what a *poll* pays before the build touches it, and the wager is neither poll nor
build but a per-answer choice. The disclosure lives on the chip, which is where a
decision states itself.

**`gateProjectionFor` does not read the stake.** Dry Run's projection still
reports a miss as leaving the run score where it stands, which is true of every
answer except an armed one. Honouring `coveragePerWrong` there would change a
projection rule written under ADR-073 and is left for its own decision; the gap
is recorded in DVTD-1gic. It needs Dry Run and strict held together and armed to
be visible.

The five prose functions in `config.model.ts` are ordered `if` chains where the
first match wins, so `wagersAnswer` is tested first in `describeConfig`,
`givesOf` and `headlineFigureOf`. `headlineFigureOf` returns the stake as a
coverage figure, which reads `+0.5 units` on the chip and is honest in the
direction that matters: it is what the config is bought for. The bill is stated
in `costs`, which the info panel renders beside it.
