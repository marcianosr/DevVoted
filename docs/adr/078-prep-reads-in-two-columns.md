# ADR-078: Prep and New run read in two columns, and the band table drops its prose

## Status

Accepted — 2026-09-13 (Marciano, DVTD-ju54). Supersedes
[ADR-072](README.md#retired), which is deleted. Carries forward 072's decisions
3 and 4, reverses its decisions 1, 2 and 5, and closes the ADR-032 consequence
it left open. Prices the bands on [ADR-076](076-the-closing-band-decides-what-it-costs.md).

Built in the kanto kit: `PrepScreen.ui.tsx`, `NewRunScreen.ui.tsx`,
`BandOutcomes.ui.tsx` and `bandOutcomes.viewmodel.ts`. Reached from `/proto-run`
only.

## Context

ADR-072 put the stakes first and the build away, which was right. It then spent
the whole page saying so: a coverage bar across the header, a five-row table
under it whose third column ran to a sentence per row, and a two-row ledger
pricing a single answer. Read end to end, prep said the same thing in three
registers before the player could act on any of it.

New run had the same problem from the other end. It drew the build twice — a
readout with no list beside a list with no readout — stacked a dashed box per
free slot under a track that already drew them, and then closed on the same band
table prep opens with, for a gate whose build was still being assembled.

Both screens are header, two columns, footer. Neither needs to say a thing twice
to get there.

## Decision

1. **Prep is two columns.** Objectives and rewards on the left, the five polls
   and the gate's audits on the right. The same grid the New run screen uses, so
   the two screens either side of a gate do not re-teach their layout.

2. **The band table is three columns: band, coverage, pays.** The outcome
   sentence comes out. What a landing does was being spelled five times in prose
   to say what the band word and the figure beside it already say.

3. **What the table cannot say per row it says once, above and below.** A lead
   line names the bands that win the gate and the bands that cost; a footnote
   says where a pay lands and what a peel is settled in. Two sentences replace
   five.

4. **Every band quotes one figure, not a range.** SHAKY quotes the peel as a
   negative, per ADR-076 decision 6, and DANGER says `the run ends` rather than
   being paid `Nothing` — a nil payout and a finished run are different facts
   and the column was collapsing them.

5. **The bar moves off the header into the outcomes panel and numbers its
   rungs.** It explains the table, so it belongs to the table. `marks="rungs"`
   is new alongside `bands` and `boundaries`: 0, the floor, the OK line, the
   healthy line and 100, as bare numbers. The table names the bands one row
   below, so naming them again on the bar was the doubling this ADR is about.

6. **The band table is prep's alone.** The New run screen drew the same five rows
   one screen earlier, for a gate whose build was still being assembled and whose
   polls had not been dealt. Two screens in a row opening on the same table made
   the second one furniture. New run states what it is for — pick a build — and
   its footer names where the stakes are read: *Prep shows what Pallet asks
   before anything is locked.*

7. **New run is the same two columns, in the shop's order: the build left, the
   deal right.** It drew the build twice, once as a readout without its list and
   once as a list without its readout, which is what put an empty box column under
   one and a bare "nothing installed yet" under the other.

   The deal is listed by the shop's `Registry`, titled **Registry**, and `Hand` is
   deleted. The two sections had one job — offer configs you can install — in two
   components with mirrored column positions, so a player crossing from New run to
   the shop had to relearn where the offers live. The registry prices New run's
   deal *free*, because the hand costs room and not storage; the shop's own
   per-slot price is unchanged.

8. **A slot that is merely empty gets no row.** The track already draws free room
   as dashed segments, so a stack of `empty slot` boxes says the same thing
   twice, the second time at four times the height. The one box that carries the
   refund press survives, because a press is not a reading. `Build` takes
   `emptySlots` for this, and `configCount` for the readout: where the chips are
   listed directly underneath, counting them in the heading is the same
   doubling.

9. **The ladder quotes the rung after the one it sells.** Under the buyable
   offer sits the next slot and its price, dimmed, unhatched and unpressable —
   `SlotOffer`'s `locked` form, the shape `WeightOffer` already had. Buying is one
   rung at a time and the ladder steps, so the price after this one is the thing
   a player wants before spending.

10. **"What it takes" comes off the screen.** It priced one answer while the
   table prices the landing that answer contributes to, and the poll screen
   states the wrong-answer cost at the moment it applies.

11. **A band's payout is priced by the answers it takes to reach.** A band's
   floor divided by the flat per-answer gain (ADR-073) is the answers needed,
   and `gateClearPayout` prices them. Prep quotes the payout the run actually
   pays rather than standing up a second implementation of it, which
   `gateReward.model.ts` warns against in as many words.

## Consequences

**Two bands can quote the same figure.** `gateClearPayout` scales on correct
answers, not on coverage, so a build strong enough to clear HEALTHY on one right
answer pays OK and HEALTHY the same. That is the engine telling the truth: at
that build there is nothing to choose between the two landings. It also means
ADR-076 decision 3 — "OK is priced by `payoutRatioFor`, so closing at 30%
against a 40% line already pays 0.75x" — describes an engine nothing pays
through. `payoutRatioFor` and `gatePayoutKb` exist in `coverageRatio.model.ts`
and no run reaches them. **Unresolved**: either the live payout moves onto
coverage, or ADR-076 decision 3 is rewritten to say what `gateClearPayout` does.

**New run and prep each have one job.** New run picks a build; prep prices the
gate. The pair used to overlap on the band table and on the build readout, and a
player walking New run → prep met the same five rows twice in a row. The handoff
is now a sentence in New run's footer rather than a repeat of prep's opener.

**Prep has its shop link back, so ADR-032 is whole again.** 072 left this open:
its screen dropped "← Back to shop" while ADR-032 rested on it. `PrepView`
supplies the aside, and names it for wherever the player came from — the build
before the first gate, the shop after every later one.

**A new run walks through prep.** `/proto-run` holds a `startStep` of its own
and shows prep between the build and the first five polls, which is what lets
the New run footer read `Pallet gate prep`. ADR-088 gave the routed flow the
same beat: `configuring` allows `/run/new` and `/run/prep`, so gate 0 states
its terms on the screen every later gate uses.

**The outcomes presenter is nobody's screen.** `bandOutcomesFor` used to live in
`prepScreen.viewmodel.ts` while `newRunScreen.viewmodel.ts` imported it across
the module. It is now `gate/application/bandOutcomes.viewmodel.ts`, which both
screens import as peers.

**The frame names its unit.** The field is `coverageGainPercent`, not
`coveragePerCorrect`: `perAnswerPreviewFor` and `gainPerCorrectFor` both return
a ratio while the ladder is in percent, and the first cut of this screen divided
one by the other and quoted every band the same figure without failing.
