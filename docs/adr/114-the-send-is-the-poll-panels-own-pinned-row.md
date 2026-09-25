# ADR-114: The send is the poll panel's own pinned row

## Status

Accepted — 2026-09-25 (Marciano, DVTD-ktf3). Extends
[ADR-069](069-the-build-sits-in-a-folded-footer.md) decision 1 rather than
amending it: the build sheet keeps its pin, and the send stacks on top of it.

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

2. **Both bars pin, as a stack.** The sheet keeps `sticky bottom-0`; the send
   sits at `bottom: <the sheet's measured height>`. A `ResizeObserver` on the
   sheet feeds that number — `Fold` is an uncontrolled `<details>` and nothing
   listens for `toggle`, so the player opening the build produces no React
   render at all, and an observer on the box is the only thing that sees it move.

   They cannot overlap. The send's natural position is always above the sheet's,
   and both are clamped against the same viewport offset, so the send stays above
   the sheet in every combination of pinned and settled.

3. **The sheet does not pin until it has been measured**, and until then the send
   holds the bare floor. Not a nicety: `startsOpen` returns true on the server,
   so SSR always renders the fold open and a phone collapses it at hydration. No
   one constant describes both, and guessing low would park an unmeasured `z-20`
   bar over the press for the whole pre-hydration window. An unpinned sheet with
   the send on the floor is correct in that gap rather than approximately wrong,
   and it is what a reader with no JS gets.

4. **The answered poll's press takes the same slot.** `commit` and `footer`
   never coexist — one sends the answer, the other moves past it — so both
   render in that one region, as they did when they shared the build bar's row.

## Consequences

`PollCommit` moved out of `BuildFooter.ui` into `PollScreen.ui`, and
`BuildFooterProps` lost `commit` and `footer` while gaining `pinned` and a
`ref`. The sheet is only the sheet; it does not know what stacks on it, only
that someone measures it.

`src/ui/` gains its first hook file and its first observer. The one measurement
this repo had was deleted for reasons recorded in `app.css` — stale coordinates
on scroll, a wrong first paint. Neither applies here: a height is not a
position, so scrolling cannot invalidate it, and nothing is pinned to be wrong
about before the first reading lands.

One dead end stays open. A sheet taller than the viewport — a phone, fold
deliberately opened, many configs — pushes the send off the top of the screen.
Shutting the fold recovers it. Clamping the offset in CSS is the fix if it ever
bites, trading a vanished press for a partly covered one.
