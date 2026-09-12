# ADR-076: The band a gate closes in decides what it costs

## Status

Accepted — 2026-09-12 (Marciano, DVTD-zu24). Supersedes
[ADR-071](README.md#retired), which is deleted. Revives
[ADR-037](037-a-missed-gate-peels-a-config.md)'s peel with a second trigger, and
reverses [ADR-075](075-a-full-bar-pays-a-bonus.md)'s last consequence.

Built in the kanto kit: `GateOutcomeScreen.ui.tsx` draws all five bands.
`survivesGate` is still one boolean, so nothing routes on it yet.

## Context

ADR-071 settled the five bands in the morning and the screens for them were
drawn the same day. Drawing them showed two of its calls to be wrong.

It said OK does not clear: you are paid, the gate stays shut, and the same gate
runs again on five fresh polls. On screen that reads as a punishment with no
name. The player met a line the ladder draws, was paid for meeting it, and still
lost the day. OK and SHAKY collapsed into one outcome at two prices, which
ADR-071 said out loud and treated as a feature. Four bands that produce three
outcomes is a rung the player can see and cannot feel, the exact failure ADR-071
itself named when it replaced the single threshold.

It also deleted the peel, handing it to
[ADR-074](074-weight-is-what-the-build-costs-to-run.md)'s unpayable upkeep bill.
That left SHAKY with nothing in it. A band whose whole content is "come back
tomorrow, worse off" is a loading screen, not a decision.

## Decision

1. **PERFECT clears and pays a bonus.** Coverage reaching 100%, which is
   `bandFor`'s existing rule and not "every poll landed" (ADR-075 Decision 1).
   The swatch is won, and marked for it.

2. **HEALTHY clears.** Swatch won, next gate tomorrow, streak kept.

3. **OK clears, thin.** The swatch is won and the climb continues, but the
   payout is cut and the streak breaks. The cut needs no rule of its own:
   `payoutRatioFor` is `ratio / healthyAt(gate)`, so closing at 30% against a 40%
   line already pays 0.75x. OK is priced by the same engine that pays every
   other band.

4. **SHAKY holds the gate and owes a peel.** The swatch is not won. The player
   picks one of two exits, and both are priced on the screen:
   - **Pay the peel and retry** the gate on five fresh polls, settling the bill
     from the archive or in configs, whichever they have.
   - **Refuse the gate and end the run**, banking `gatesCleared / GATE_COUNT` of
     the archive, the same credit a death banks.

5. **DANGER ends the run when the gate shuts.** No retry, no peel, no choice.

6. **The peel is a quota of slots, priced in KB.** `peelQuotaSlotsFor` stays the
   authority on how much comes off. Converting the quota at
   `DRAFT_COST_PER_SLOT_KB / 2` gives a bill the archive can settle, so one debt
   has two currencies and one number. A dropped config settles its own
   `sellRefund` and nothing more; whatever you overpay is gone, which is what
   ADR-037 always said.

## Consequences

**OK is a rung the player can feel.** It costs the streak and a slice of the
payout, and it costs neither the day nor the swatch. That is a different price
from SHAKY rather than a smaller helping of the same one, which is what the four
rungs on the bar were drawn to promise.

**The peel has two triggers.** A shaky close fires it, and so does an unpayable
upkeep bill (ADR-074 Decision 4). ADR-071 removed the first of those on the
argument that retrying a gate with a smaller build is a doom loop. It is not one
here, because paying the peel is no longer the only way past: refusing the gate
banks the climb instead. A player who cannot afford the retry has somewhere to
go that is not a worse attempt.

**Refusing the gate is the first voluntary end that pays.** Abandoning banks
nothing (wiki 2.7) and always did, deliberately, so that walking away is never a
cash-out. This is different: the gate has already been answered and failed, so
there is no attempt left to duck. The player is choosing between a bill and a
credit, not between playing and not playing.

**The run-over screen wears cinnabar rather than the gate's colour.** Every
other kanto screen inherits its gate's theme, and this one does not, because
there is no next gate for the colour to point at. The hero swatch stays honestly
dashed in the gate's own hue rather than being recoloured, since a screen may
change its mind about its theme and a swatch may not lie about which gate it is.

**The swatch is marked, which reverses ADR-075's closing line.** A perfect clear
wears `.legendary-ring` over the gate's normal themed fill. It is not
`finish: "fill"`: that finish means "no single colour at all" and is Champion's,
and `hasThemeColor()` is false for it, so a prismatic Lavender swatch would strip
the Lavender screen of its colour. The ring composes through a `::before` mask
and leaves the fill alone. Scope is the hero swatch on the debrief; whether the
strip and the collection surface carry the mark is still open (DVTD-dr5y).

**One screen draws all five.** `GateClearScreen` and `GateHoldScreen` are
deleted from the kanto kit. They were near-duplicates that shared no code, and a
band that decides the outcome is a poor fit for a file that has to be chosen
before the outcome is known. `GateOutcomeScreen` derives its band from the
coverage bar's own numbers rather than taking it as a prop, on ADR-070 Decision
4's reasoning: the headline colour, the swatch state and the tail cannot then
disagree with the bar they sit under.

**The kanto fixtures moved onto `coverageRatio.model.ts`.** They read
`coverageDemandFor`, the legacy ladder that runs to 375%, which cannot be drawn
on a banded bar. Gate 4 now asks 40% rather than 60%. The two engines still
coexist in the code, and the terminal-theme screens still run the old one.

**The payouts the new engine quotes are large.** A 12-slot build closing gate 4
healthy on a streak of 3 is paid over 700 KB, against config prices in the low
hundreds. That is `gatePayoutKb` doing exactly what it says, not a fixture
choice, and it is the first thing to look at if the economy reads as loose.
