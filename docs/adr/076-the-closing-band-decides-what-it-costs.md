# ADR-076: The band a gate closes in decides what it costs

## Status

Accepted — 2026-09-12 (Marciano, DVTD-zu24). Supersedes
[ADR-071](README.md#retired), which is deleted. Revives
[ADR-037](037-a-missed-gate-peels-a-config.md)'s peel with a second trigger, and
reverses [ADR-075](075-a-full-bar-pays-a-bonus.md)'s last consequence.

Built in the kanto kit: `GateOutcomeScreen.ui.tsx` draws all five bands.
Routed by `gateRulingFor` since
[ADR-094](094-the-bands-are-cut-in-answers-and-widen-with-the-climb.md), which
also amends this ADR: a hold names its reason. The clamp that held the
debrief's bar inside the verdict's band is deleted by
[ADR-160](160-the-gate-close-is-recorded-once.md): the bar is the recorded
meter, and the verdict is the recorded closing.
`survivesGate` is still one boolean, so nothing routes on it yet.

## Context

ADR-071 settled the five bands in the morning and the screens were drawn the
same day. Drawing them showed two of its calls to be wrong.

It said OK does not clear: you are paid, the gate stays shut, and the same gate
runs again on five fresh polls. On screen that reads as a punishment with no
name: the player met a line the ladder draws, was paid for it, and still lost
the day. OK and SHAKY collapsed into one outcome at two prices. Four bands that
produce three outcomes is a rung the player can see and cannot feel, the exact
failure ADR-071 named when it replaced the single threshold.

It also deleted the peel, handing it to
[ADR-074](074-weight-is-what-the-build-costs-to-run.md)'s unpayable upkeep bill.
That left SHAKY with nothing in it. A band whose whole content is "come back
tomorrow, worse off" is a loading screen, not a decision.

## Decision

1. **PERFECT clears and pays a bonus.** Coverage reaching 100%, which is
   `bandFor`'s existing rule and not "every poll landed" (ADR-075 Decision 1).
   The swatch is won, and marked for it.

2. **HEALTHY clears.** Swatch won, next gate tomorrow, streak kept.

3. **OK clears, thin.** The swatch is won and the climb continues, and the streak
   breaks.

   This decision also said the payout is cut, because `payoutRatioFor` already
   pays `ratio / healthyAt(gate)`. **That cut was never wired** (found
   2026-09-22, DVTD-tjc7): `gateClearPayout` scales by the raw count of right
   answers and never reads a band, and `payoutRatioFor` is reachable only from a
   test factory. OK, HEALTHY and PERFECT pay the same KB; what OK costs today is
   the streak. [ADR-096](096-a-config-can-promise-a-band-or-catch-one.md)'s SLA
   is the first thing that makes a better clearing band pay more.

4. **SHAKY holds the gate and owes a peel.** The swatch is not won. The player
   picks one of two exits, both priced on the screen:
   - **Pay the peel and retry** the gate on five fresh polls, settling the bill
     from the archive or in configs, whichever they have.
   - **Refuse the gate and end the run**, banking `gatesCleared / GATE_COUNT` of
     the archive, the same credit a death banks.

5. **DANGER ends the run when the gate shuts.** No retry, no peel, no choice.

6. **The peel is a quota of slots, priced in KB.** `peelQuotaSlotsFor` stays the
   authority on how much comes off. Converting the quota at
   `DRAFT_COST_PER_SLOT_KB / 2` gives a bill the archive can settle, so one debt
   has two currencies and one number. A dropped config settles its own
   `sellRefund` and nothing more; any overpayment is gone, as ADR-037 always said.

## Consequences

**OK is a rung the player can feel.** It costs the streak and a slice of the
payout, and neither the day nor the swatch: a different price from SHAKY rather
than a smaller helping of the same one, which is what the four rungs on the bar
promise.

**The peel has two triggers.** A shaky close fires it, and so does an unpayable
upkeep bill (ADR-074 Decision 4). ADR-071 removed the first on the argument that
retrying a gate with a smaller build is a doom loop. It is not one here, because
refusing the gate banks the climb instead: a player who cannot afford the retry
has somewhere to go that is not a worse attempt.

**Refusing the gate is the first voluntary end that pays.** Abandoning banks
nothing (wiki 2.7), deliberately, so walking away is never a cash-out. Here the
gate has already been answered and failed, so there is no attempt left to duck:
the player chooses between a bill and a credit, not between playing and not.

**The run-over screen wears cinnabar rather than the gate's colour.** There is no
next gate for the colour to point at. The hero swatch stays dashed in the gate's
own hue, since a screen may change its mind about its theme and a swatch may not
lie about which gate it is.

**The swatch is marked, which reverses ADR-075's closing line.** A perfect clear
wears `.legendary-ring` over the gate's normal themed fill. It is not
`finish: "fill"`: that finish means "no single colour at all" and is Champion's,
and `hasThemeColor()` is false for it, so a prismatic Lavender swatch would strip
the Lavender screen of its colour. The ring composes through a `::before` mask
and leaves the fill alone. Scope is the hero swatch on the debrief; whether the
strip and the collection surface carry the mark is still open (DVTD-dr5y).

**One screen draws all five.** `GateClearScreen` and `GateHoldScreen` are
deleted, from the kanto kit first and from `terminal-theme/screens/` when
`/proto-run` moved onto the kanto set. They were near-duplicates sharing no code,
and a band that decides the outcome fits poorly in a file chosen before the
outcome is known. `GateOutcomeScreen` derives its band from the coverage bar's
own numbers rather than taking it as a prop, on ADR-070 Decision 4's reasoning:
the headline colour, the swatch state and the tail cannot then disagree with the
bar they sit under.

**The kanto fixtures moved onto `coverageRatio.model.ts`.** They read
`coverageDemandFor`, the legacy ladder that ran to 375%, which cannot be drawn on
a banded bar. The bridge that normalised it, `gateBand.viewmodel.ts`, went when
ADR-073 landed on 2026-09-13 and the real ladder started feeding the bar. Gate 4
asks 25% under the rebased ladder.

**The payouts the new engine quotes are large.** A 12-slot build closing gate 4
healthy on a streak of 3 is paid over 700 KB, against config prices in the low
hundreds. That is `gatePayoutKb` doing what it says, not a fixture choice, and
it is the first thing to look at if the economy reads as loose.
