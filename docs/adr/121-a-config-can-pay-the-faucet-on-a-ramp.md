# ADR-121: A config can pay the faucet on a ramp, if it states its next rung

## Status

Accepted — 2026-09-26 (Marciano, DVTD-oj5r). Ships `&&`. Answers the objection
recorded in DVTD-72d9 and the one DVTD-rfhb was written to enforce. Leaves
[ADR-083](083-a-coverage-config-multiplies-or-adds-units.md) whole: nothing here
touches coverage.

## Context

Every per-answer storage config pays a flat rate. IndexedDB pays 8 KB a correct
answer, A/B Test's B arm pays the same, Database holds 8 KB and settles it on the
clear. All three draw on one `FAUCET_CAP_KB` of 320 KB a run.

`&&` had been in the roster backlog since August as "consecutive correct answers
create a combo", blocked on two objections nobody had answered.

The first is in DVTD-72d9's own audit: *"`&&` vs the built-in streak bonus:
coverage scoring already pays a streak multiplier. `&&` must pay in a different
currency or it is just a second streak dial."* The engine's streak already pays
`STREAK_UNIT_STEP` per answer and multiplies the gate's KB payout at the clear.
A second config on that dial reads as one mechanic with two names.

The second is the reason `.reduce()` was deleted two days ago (DVTD-rfhb, which
took ADR-090 with it): *"it replaces the flat streak step with a growing one,
which reads as a second, hidden coverage ladder on an axis the player cannot
see."* That is a pillar 2 failure — a number that changes under the player
between answers, with nothing on screen saying what it is now.

A ramping payout is worth having. It is the only shape in which a long clean run
is worth more than the sum of its answers, and it is what `&&` means: `a && b`
runs `b` only if `a` succeeded, and one false short-circuits the chain.

## Decision

1. **A config may pay the faucet on a ramp.** `chainStartKb` names the opening
   rung and `chainKbFor` doubles it per link: `chainStartKb × 2^(link − 1)`. `&&`
   opens at 1 KB and reaches 256 KB on the ninth link. Nothing else in the roster
   reads the axis.

2. **It pays storage, never coverage.** This is the whole answer to DVTD-72d9's
   objection. `streakUnitBonus`, `streakMultiplier` and `BASE_STREAK_STEPS` are
   untouched, and `&&` adds no term to `answerPayoutFor`. It is a second addend
   on `rawFaucet` in `scoreAnswer`, beside `faucetKbPerCorrect`.

3. **It must state what its next link pays, before the answer.** `ConfigStatus`
   carries `nextLinkKb`, so the config's own row on the poll screen quotes the
   figure the player is about to earn. This is the condition on Decision 1, not
   a nicety: the axis DVTD-rfhb deleted is legal again only because it is
   readable. Dependabot's `bumpIn` is the shipped precedent.

4. **The chain counts the run, not the window.** `chainLengthOf` folds
   `allAnswered` — correct extends, wrong resets, a partial holds, mirroring
   `nextStreak` and the ADR-042-derived streak rule. A gate clear zeroes
   `RunState.streak` and deliberately does not touch the chain. That difference
   is the point: if the chain reset every window it would top out at five links,
   16 KB, and be a worse IndexedDB.

5. **It draws on the shared cap.** `&&` is in `drawsOnFaucet`, so it reports
   `capLeftKb`, skips with `runCapReached` when the faucet is dry, and is clamped
   by the existing `Math.min(rawFaucet, faucetRemainingKb(...))`. No new clamp
   was written.

6. **The balance lever is the roster number.** `chainStartKb: 1` empties the
   faucet on the ninth link; 2 would empty it on the eighth. Tune the entry, not
   `chainKbFor`.

## Consequences

`&&` is an opening-game plan, the way Freemium is. Nine correct answers in a row
take 320 KB and leave the config paying nothing for the rest of the run, which is
a large early swing and dead weight afterwards. Four slots price that. If it
reads too swingy in play the lever is `chainStartKb`, not the doubling.

Because the chain crosses gates, it also crosses the daily lock: a player who
ends a day mid-chain resumes on the same link. That follows from `allAnswered`
being the run's whole log and is intended — the chain is a property of the run,
not of a sitting.

`cachedHitsFor` is now `chainLengthOf` with a category filter, which is what it
always was. Cache and `&&` therefore share a fold and differ only in scope. The
pre-existing collision DVTD-72d9 records between Cache and the unbuilt `.every()`
is untouched and still open.

`PollStatusContext` gains a required `chainLength`, so every construction site
supplies it. There is one in the engine and one in the test harness; a required
field was chosen over an optional one for the same reason `autoUpgradeProgress`
is required — a status that silently reads zero would quote the wrong figure.

A same-category variant was considered and rejected the same session: the
per-category correct run is already computed and already paid for by Cache, the
condition is not steerable by the player, and category has nothing to do with
what `&&` means.
