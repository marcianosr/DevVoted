# ADR-136: The prep stakes column leads with the reward

## Status

Accepted — 2026-09-28 (Marciano, DVTD-e6zc). Supersedes
[ADR-080](080-the-swatch-is-won-by-the-window.md) D4's two-row panel and
[ADR-078](078-prep-reads-in-two-columns.md) D3's lead line, and corrects the
swatch objective onto ADR-080 D1. ADR-078's one figure per band and its
numbered rungs stand; its table is superseded by [ADR-149](149-prep-reads-the-stakes-as-a-ladder-and-seals-the-gates-ahead.md),
which also supersedes decision 5 below.

Built in the kanto kit: `Objectives.ui.tsx`, `Lead.ui.tsx`, `BandOutcomes.ui.tsx`
and `bandOutcomes.viewmodel.ts`.

## Context

The column was titled *Objectives and rewards* and named no reward. Each
objective read as a demand followed by its own restatement — *Finish at OK or
better · to clear the gate*, *Finish at PERFECT · to arm an audit* — under two
section labels, *Main objective* and *Extra objectives*, that said only which
list you were in. The one thing a player wants before committing a build, what
the day pays, appeared nowhere but the band table at the bottom.

The swatch objective was worse than redundant. It read *Finish at PERFECT · to
earn the Lavender swatch*, while ADR-080 D1 awards the swatch for a flawless
window and its own Consequences say the two are not the same test. At a deep gate
a clean window rarely fills the bar. The panel had been quoting a rule the engine
does not run.

## Decision

1. **The panel is titled At stake, and every objective states its prize.** An
   objective is two lines: the demand, then `earns` and the reward. *Finish at
   **OK** or better* / *earns **advance to Boulder**, **+13 KB** or more*. The
   purpose clause comes out; naming the reward says what it was reaching for.

2. **The clear names the next gate and quotes its own table row.** The figure is
   `paysOf` on the clearing rung — the same call the ladder makes — rather
   than a second computation. ADR-078 D11 priced the bands through
   `gateClearPayout` for this reason; a panel that states a figure twice must
   state it from one place.

3. **The swatch is asked for as a flawless window.** *Answer all 5 right · earns
   the **Lavender swatch***, with the gate's own swatch marking the badge. This
   is ADR-080 D1 said on the screen that sells it.

4. **Nothing is marked met or out of reach.** `Objective.met` and `.lost`, the
   tick, the cross and the `landsAt` predicate are deleted. The coverage bar and
   the window's poll row sit directly under the objectives and both read live;
   a third reading of the same state was the doubling ADR-078 was written
   against.

5. **The band row the run is standing in is edged in its own colour.** Superseded
   by [ADR-149](149-prep-reads-the-stakes-as-a-ladder-and-seals-the-gates-ahead.md): the ladder rings the zone, read off the same number the pin uses.

6. **Audits are stated nowhere in this column.** The *arm an audit* objective is
   gone. Where an audit is acquired is DVTD-406l's question, and prep's right
   column already draws the Audits panel shut with the gate that opens it — the
   left column saying it again was the second copy.

7. **A statement is a `Lead` line, not a bespoke shape.** `Lead` already set
   strings and badges in one sentence; it gains a swatch part and an `as`
   passthrough, and `Objectives` loses `ObjectiveStatement`, `ObjectiveFigure`
   and its own mark renderer.

## Consequences

**`clearingRungFor` can never return PERFECT, so the objective never has to
handle it.** `coverageRungsFor` always emits a HEALTHY rung and HEALTHY always
clears, so the reduce bottoms out at HEALTHY when OK is squeezed away. The first
cut of decision 1 guarded `or more` against a PERFECT clear; that branch was
unreachable and is deleted.

**Prep no longer states the two right answers the day itself owes.** ADR-094's
floor still holds — a bare build that covered plenty is still held at the
gate — but the `met` tick was the only place the screen said so, and decision 4
removes it. Nothing on prep names the floor today. **Unresolved**: either the
floor gets its own line, or the debrief is accepted as the first place a player
meets it.

**`correctThisGate` leaves three frames.** It fed only `landsAt`, so
`BandOutcomesFrame` drops it, `PrepFrame` drops the `answeredThisGate` it was
computed from, and the kanto factory drops `windowCorrect`. `answered` survives
in the factory because `perAnswerPreviewFor` reads it for the coverage gain.

**A `src/ui` spec may not reach the swatch roster directly.** `Objectives` and
`Lead` need a real `GateSwatch` to render a marked badge, and
`ui-stays-presentational` refuses `src/ui/**` → `src/modules/**` for runtime
values. The specs take `gateSwatchAt` from `~/test/swatchTrack.factory`, which
is where the stories already got it.
