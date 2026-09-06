# ADR-063: A config can be paid for a prediction

Status: Accepted — 2026-09-06. Amends 035 (what a config may ask of the player) and
037 (what a missed gate pays).

## Context

The roster sells coverage magnitude twelve times over, storage five times, and
information four. Nothing scores whether a player knows their own accuracy, which is
the one thing a learning game has a special reason to reward. Planning Poker
(DVTD-68jr) asks for a number before the gate and pays only if that number was exactly
right.

## Decisions

**The payout is 32 KB times the estimate, and only an exact call pays.** A flat
per-hit payout was considered and rejected: it makes the optimal play "predict your
most likely count", which is a quiz with one right answer rather than a bet. Scaling
by the estimate puts the expected value one notch above an honest guess, so the config
prices optimism, which is what planning poker is about. The cost is that strong
players earn more from it than weak ones; that is accepted.

**The estimate runs 1 to 5, not 0 to 5.** Under this payout an estimate of nothing
pays nothing, and a control offering a press that provably pays zero is noise.

**It pays after a missed gate.** This is a third exception to ADR-037's rule that a
miss pays nothing, after the faucet and Garbage Collection, and it is the load-bearing
one: if a low estimate could only pay on a gate that somehow cleared anyway, nobody
would ever make one and the config would collapse into a bonus for perfection. It
settles a prediction; it does not reward a clear. On a fatal miss the payout lands
before the run ends, so it banks at the normal death rate.

**Asking for a number is not a demand.** ADR-035 says configs demand nothing of the
player, meaning no config may impose a knowledge requirement. An input the player
chooses to give is a different thing, and the roster already has two: A/B Test's arm
and `git rebase -i`'s ordering. Planning Poker is a third, and the gate still owns
every requirement.

**The estimate locks on the gate's first answer.** Enforced the way `git rebase -i`
enforces its ordering — by run status, not by a flag: `canEstimate` is true only in
`configuring` and `rewarding`, so the moment the gate starts, the action refuses and
the control leaves the view. Unlike rebase, the commitment is a `RunState` field
rather than a mutation of `polls`, because `hydrateRunState` rebuilds `polls` from the
database on every action and would discard it.

**A committed estimate and no estimate are different states, and the record keeps
them apart.** `estimateThisGateKb` is undefined when no number was committed and a
number (0 included) when one was, which is what lets the gate report tell "no bet"
from "lost the bet" after the commitment itself has been cleared for the next window.

**The reward report gains its first failing row.** `GateRewardStatus` has declared
`failed` since ADR-035 without anything able to produce it, because a config that
demands nothing can never fail. A config that can be wrong about its own prediction
can, and the CI-build-log framing finally gets a red row that means something. The row
reads pass or fail off the KB the engine actually paid rather than recomputing the
comparison, for the same reason the storage ledger derives its base by subtraction: a
second implementation of a verdict is free to disagree with the first.

**No upgrade path.** A config only becomes upgradable by joining `isUpgradable`'s
list, so this costs nothing to withhold. The bean's idea of a level that half-pays a
near miss is the interesting one and needs its own design; a level that merely
multiplies the money changes no decision.

## Consequences

The config ships in the terminal-theme prep screen that `/proto-run` mounts, alongside
`git rebase -i`, which is the only other pre-gate control and is likewise unwired in
the authed `/run/*` stack. Wiring prep-time commitments through `RunPrep` remains
undone for both.
