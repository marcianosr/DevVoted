# ADR-118: A config may require the input it reads

Status: Accepted — 2026-09-26. Amends 035 (Decision 1) and 085.

## Context

Two configs ask the player for something in prep. Planning Poker takes a bet of
1 to 5 on how many of the window's five polls will be right; SLA takes a promise
of OK, HEALTHY or PERFECT. Both were optional, and neither said where the choice
was made.

Optional is the wrong shape, and the reason is arithmetic rather than taste.
Both payouts are floors that cost nothing when missed: `estimatePayoutUnits`
returns 0 when `correct < estimated`, `slaUpliftKb` returns 0 when the band is
missed, and neither can take anything off a gate. So betting 1 strictly
dominates not betting, and promising OK strictly dominates not promising —
there is no state of the world in which declining is better. A dominated option
is not a decision, it is a trap: a player could carry Planning Poker for
thirteen gates, never bet, and never be told the slot was paying nothing.

That is a pillar 2 failure — an affordance withheld in silence reads as a
mechanic that does not exist.

## Decisions

**A config may require the input its own effect reads.** It may not require
knowledge, an answer, a resource, or anything a gate requires. The demand is
legal only when all four hold: it exists solely because the player installed the
config; it is satisfiable on the screen that states it; a legal choice always
exists while it stands; and no choice is disqualifying — picking is what is
required, not picking correctly.

This amends ADR-035 Decision 1, *"a config is an effect with a price, it demands
nothing"*. The fear that rule was written against was a config gating on the
player knowing something, and that stays forbidden. Supplying an input the
config exists to read is the fee for installing it, not a bar to clear.

It also amends ADR-085's *"asking for a number is not a demand… an input the
player chooses to give is a different thing"*. It is now a demand, and the
sentence above is the rule it answers to.

**The gate is held, not the action refused loudly.** The press is disabled and
the screen states which config is waiting and what it wants. No error is
thrown and no refusal channel is added: the reducer's contract is identity on
refusal, and a sentence under the press the player is already looking at beats
an error after a press that should never have been live.

**The hold is keyed on the action, not written into either exit.** Prep is left
through `start` at gate 0 and through `finish-reward` at every gate after it,
in two different files, and only the first had any guard at all. A rule about
leaving prep that lives inside one of them holds for one age of the run and
leaks for the rest, so `PREP_EXITS` names both and `reduce` checks it once —
the same shape `SHOP_WRITES` already uses.

**Always-satisfiable is a liveness requirement, and it is met here without a
carve-out.** Turning a permissive predicate into a blocking one can strand a
run: ADR-087's amendment needed one, because a build holding only the locker has
no legal target. Neither config needs one. `ESTIMATE_CHOICES` is 1 to 5 and
`SLA_BANDS` is three bands; both are constants, neither depends on state. The
predicates also share their first two clauses with the control factories, so
the gate is only ever held while the control that lifts it is on screen. A
future commitment whose choices can run out — a dealt hand of spent cards, say
(DVTD-6ce4) — is the first case that would need the carve-out.

**Committed and not-committed stay different states.** `estimatedCorrect`,
`slaBand` and `estimateThisGateUnits` all stay optional. Mandatory is a
reachability property of the reducer, not a change of type: persisted snapshots
from before this ADR carry no call, and `estimateThisGateUnits === undefined`
narrows in meaning from "the player skipped the bet" to "the config was not in
the build when the window closed". ADR-085's distinction survives, narrower and
more honest.

**Prep gains the vendor refusal it never had.** ADR-087's amendment claimed both
prep screens hold their exit while the vendor names nobody. That was true of the
build and the shop and false of prep itself, which dispatches `start` and so was
refused with nothing said. Folding vendor lock into the same hold closes it and
gives `finish-reward` the guard `start` always had.

## Consequences

- The budget is spent. ADR-042 logs "if configs never demand anything, a config
  is pure upside and drafting is never a hard choice" as an open tension; ADR-087
  spent it once and this spends it again. A third demand means pillar 3 should be
  rewritten rather than chipped at.
- Planning Poker's own unlock (`exact-estimates`, three met calls) lands sooner,
  because a bet now exists at every gate for anyone who buys the config off the
  shelf before earning it.
- The story harness has to answer a build's prep calls before it can open gate 0,
  which is what a player does too.
