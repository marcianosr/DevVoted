# ADR-114: The send is the poll panel's own pinned row

## Status

Accepted — 2026-09-25 (Marciano, DVTD-ktf3). Extends
[ADR-069](069-the-build-sits-in-a-folded-footer.md) decision 1 rather than
amending it: both bars pin, as a stack.

Decisions 2 and 3 reversed — 2026-09-26 (Marciano, DVTD-967r). The stack is the
same stack; which bar holds the floor swapped. Decisions 1 and 4 stand.

## Context

ADR-069 pinned the build sheet to the bottom of the poll screen, and the
answer's send was put inside it, above the fold, so that shutting the build
could not take the press away. That made the send a property of the build bar
rather than of the poll: it sat outside the poll panel's border, under a heading
that says Build, and it read as one of the build's controls.

Two bars cannot share one offset. Pinning the send at `bottom: 0` beside the
sheet lands them on each other, and the sheet's height is not a number anyone can
write down: its fold opens, its badges wrap, a web font lands. The gap the send
has to clear is a measurement, not a constant.

## Decision

1. **The send is a region of the poll panel**, between the question and the
   author credit: a note on the left, the press on the right, `sticky bottom-0`
   inside the panel. It rides the bottom of the viewport while the poll runs off
   the end of it and settles above the byline once the panel's end is in view.
   The press now sits inside the border of the thing it commits.

2. **Both bars pin, and the send holds the floor.** The send keeps
   `sticky bottom-0`; the sheet sits at `bottom: <the send's measured height>`.
   A `ResizeObserver` on the send feeds that number.

   The send is the one press the screen is asking for, and a press that has to
   be found above another bar is not the first thing a thumb reaches. The sheet
   is the thing a player opens when they want it, so it is the thing that moves.

   Originally the other way round, on the reasoning that the sheet was the
   heavier furniture and should sit on the floor. That read the stack as
   scenery. It is not: one of these two bars is the screen's question and the
   other is a reference, and the question goes where the hand is.

   The observer stays for the same reason it was introduced, now pointed at the
   other bar: `Fold` is an uncontrolled `<details>` and nothing listens for
   `toggle`, so the player opening the build produces no React render at all,
   and the send's own height moves too — its note changes length as the answer
   does, and it wraps at narrow widths.

   They cannot overlap. The sheet's natural position is always above the send's,
   and both are clamped against the same viewport offset.

3. **The sheet does not pin until the send has been measured**, and until then
   the send holds the floor alone and the sheet stays in the flow. Not a
   nicety: the send's height is not a constant anyone can write down, and
   guessing low would park an unseated `z-20` bar over the press for the whole
   pre-hydration window. An unpinned sheet is correct in that gap rather than
   approximately wrong, and it is what a reader with no JS gets.

4. **The answered poll's press takes the same slot.** `commit` and `footer`
   never coexist — one sends the answer, the other moves past it — so both
   render in that one region, as they did when they shared the build bar's row.

## Consequences

`PollCommit` moved out of `BuildFooter.ui` into `PollScreen.ui`.
`BuildFooterProps` lost `commit` and `footer`, and takes a single `seat` — how
far off the floor it rides, absent until the press below it has been measured.
The sheet is only the sheet; it does not know what it stands on, only how high.

`src/ui/` gains its first hook file and its first observer. The one measurement
this repo had was deleted for reasons recorded in `app.css` — stale coordinates
on scroll, a wrong first paint. Neither applies here: a height is not a
position, so scrolling cannot invalidate it, and nothing is pinned to be wrong
about before the first reading lands.

One dead end stays open. A sheet taller than the viewport — a phone, fold
deliberately opened, many configs — pushes the send off the top of the screen.
Shutting the fold recovers it. Clamping the offset in CSS is the fix if it ever
bites, trading a vanished press for a partly covered one.
