---
# DVTD-yzyg
title: Endless run past the Champion gate
status: draft
type: feature
priority: high
created_at: 2026-08-25T10:54:18Z
updated_at: 2026-08-25T10:54:18Z
parent: DVTD-kulw
---

Clearing the Champion gate ends the run. Offer a third option: bank the win, or keep
climbing into an endless stretch past gate 12.

## What clearing gate 12 does today

- `VICTORY_GATE = 12`, `GATE_COUNT = 13`. The swatch ladder runs Pallet (0) through
  Earth (10), Elite (11), Champion (12), and stops. Every gate has a name and a badge;
  gate 13 has neither.
- Victory sets status `won`, banks 100% of run storage (`storageCreditRate("victory")`),
  and routes to the terminal summary.

## Every scaling table clamps at 12, and that is the whole problem

- `coverageDemandFor` reads `COVERAGE_DEMANDS[Math.min(gatesCleared, 12)]`, so the demand
  freezes at 340.
- `failStripsFor` freezes at 4 strips the same way.
- `gateBaseMultiplier` is `gatesCleared + 1` and does **not** clamp, so the reward keeps
  climbing.
- `STORAGE_PLANS` stop staging at `fromGate: 10`, and the audit roster's deepest entry is
  gate 12, so endless gates arrive unaudited.

Put together: past gate 12 the run pays more every gate while demanding the same, with
no new audits and no new swatches. Endless as a bare `continue` flag makes the game
strictly easier and strictly richer the longer it runs. Each of those tables needs an
extrapolation rule, and that is most of the work here.

## There is also no risk to continuing

`storageCreditRate` gives a death 100% credit once `gatesCleared >= GATE_COUNT`, so a
player who continues and then dies at gate 14 banks exactly what banking at 12 would
have paid. Continuing is free expected value, which is not a decision.

Balatro's answer is the reference: the win is *recorded* at the summit, and everything
after it is a separate, riskier score. Options here:

- Bank at 12 and play the endless stretch for a separate, non-banking scoreboard.
- Continue with the banked total at stake, so a death past 12 costs some of the win.
- Continue with only the *new* storage at stake, the win itself already safe.

The second is the real gamble; the third is the friendly version. Pick one deliberately.

## The supply limit nobody can design around

A gate is `SLICE_WINDOW` (5) polls from the shared daily window. Endless needs unbounded
polls, and the day does not have them. So endless is bounded by the poll budget in
practice, and the screen has to say so rather than letting a player discover it at
gate 15. Ties into DVTD-g7ut (show what today's budget allows and why).

## Naming

Victory Road sits *before* the Elite Four in Kanto, so using it for the post-Champion
stretch inverts the source the whole ladder is named from. The canonical post-Champion
Kanto location is **Cerulean Cave** (Unknown Dungeon), which is literally the postgame
area that exists only after you beat the Champion. It fits the swatch scheme and needs
no explanation to anyone who has played the games.

## Todo

- [ ] Decide the stake: what a death past gate 12 costs
- [ ] Write the extrapolation rules for demand, strips, reward multiplier and audits
- [ ] Decide what the endless gates are called and whether they earn anything collectible
- [ ] Say what happens when the day's polls run out mid-stretch
- [ ] Pick the name
- [ ] ADR it: this touches ADR-034's demand curve and ADR-037's peel table
