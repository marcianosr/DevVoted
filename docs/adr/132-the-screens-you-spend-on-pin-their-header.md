# ADR-132: The screens you spend on pin their header

## Status

Accepted — 2026-09-27 (Marciano, DVTD-aytv). Extends
[ADR-130](130-the-bar-carries-what-every-screen-needs.md) with the seat the bar
owes the page. Narrows
[ADR-113](113-the-poll-screen-stands-coverage-beside-the-question.md) decision 4
to the poll screen.

Amended 2026-09-28 (Marciano, DVTD-s02d) after playing it: decision 1 was wrong
on both of its clauses, decision 3 never shipped, and decision 7 is new.

Amended 2026-09-29 (Marciano, DVTD-o70a): decision 1 now covers every run
screen but the hub, not only the screens that spend.

## Context

The header states the balance
([ADR-124](124-the-balance-names-every-change-one-at-a-time.md)) and the bar
deliberately does not (ADR-130 decision 4). On the two screens where storage is
spent — the shop and a new run — the figure every price is read against scrolls
away on the first flick, and the shelf below is long enough that it stays away.

ADR-113 decision 4 took a top pin off the poll screen's coverage panel, because
on a phone it ate the top of the viewport for a whole poll. That objection holds
for a reference reading beside a question. It does not transfer to the figure
every row below is priced against.

## Decision

1. **Every run screen but the hub pins the same header, and pins one row of it.**
   The shop, a new run, prep, the poll, the gate result, the review and run
   over. It started as the screens that spend, because those are priced against
   the balance. After playing it, a bar that is there on some run screens and
   replaced by a hero heading on the others made the top of the screen change
   shape at every step of the run. One bar in one place won over the rule. The
   gate result keeps its outcome as the title, its grade chips as the header's
   badges and the PERFECT ring on the mark. The hub keeps its own strip
   ([ADR-147](147-the-hub-shows-the-run-so-far.md)), which already states the
   same readout.

   What hangs is the gate mark, the screen's name, the swatch track and the
   balance, in one row. The note and any coverage reading stay in the flow and
   scroll away. The first draft of this decision refused the split because
   "half a header is a second layout to design" — the second layout turned out
   to be one flex row the header already built. The track first stayed in the
   flow on its own row, as reference. Played, that row floated loose under the
   bar, cut off from the gate it counts, so it moved into the title row, where
   it costs no height.

   Structurally the two halves are siblings, not a box inside a box: a sticky
   element holds only while its own parent is in view, so a row nested in the
   header would unstick the moment the header's box scrolled past. `<header>`
   stays the landmark and keeps the title.

2. **It pins from `md`, never on a phone.** The shop already pins its press to
   the bottom below `md`, and two pinned edges on a phone leave a slot of offers
   between them — which is ADR-113 decision 4's objection, and it is right at
   that width. At `md` the press goes static and the screen goes two-column.

3. **A pinned header hangs from the viewport's top, because the bar does not
   occupy it.** `md:top-0`, no seat and no contract. This decision originally
   described a `--nav-seat` custom property the bar published and held itself to
   with `min-height`, on the premise that the bar is opaque and pinned at
   `z-30`. None of that is true: ADR-130 left `AppNav` scrolling with the page,
   with no `z-index` at all, and a spec holds it there. There is nothing at the
   top edge to hang off.

   The reasoning below is kept because it is the argument to have again the day
   someone pins the bar — at which point the bar needs a rung above `z-20`, and
   the header needs the seat.

   A number rather than a `ResizeObserver`, against
   [ADR-114](114-the-send-is-the-poll-panels-own-pinned-row.md) decision 2's
   precedent: the send's height is not a constant anyone can write down and the
   bar's is. A measured seat lands only after hydration, and the reader with no
   JS is the one ADR-114 decision 3 was protecting. The contract only fails
   safely — a bar taller than its seat tucks into the header's own headroom,
   where a bar shorter than its seat would open a slit, which `min-height`
   forbids.

4. **A pinned header carries its own ground, spanning the body's padding.**
   `bg-theme-faint` and a rule on the edge the page slides under, bled with the
   same tokens `ScreenActions` uses at the other edge. It takes the room out of
   the body's own padding and the gap below it, so pinning moves nothing.

   It states its width in the branch, never in the base class: a bled bar has no
   width of its own, and `w-full` beside `-mx-8` does not widen a box, it shifts
   it left and leaves the right gutter bare.

5. **The slab keeps 24px of headroom for the balance pill.** ADR-124's pill
   stands 4px above a 20px badge above the figure. Without the headroom a spend
   names its change underneath the bar. The 4px it drifts on the way out is not
   reserved: it is already fading.

6. **Pinned screen chrome sits at `z-20`.** Under the bar, and under anything
   that opens over the screen — a tooltip, a config's panel, which matters on a
   shop where every offer has one. The same rung the footer bar holds, which it
   never meets.

7. **A pinned balance reads as one chip, and keeps its word for a reader.**
   `Balance` gains an `inline` layout: the floppy, the figure and the unit on one
   bordered row, instead of the figure over `💾 Storage balance`. A two-line
   block sets the height of the bar it hangs in, and the bar is the thing being
   made thin. The label is not dropped — it goes `sr-only`, because the floppy
   carries the meaning only for someone who can see it, and a bare `96 KB` read
   aloud names nothing.

   ADR-124 is untouched: the readout stays the ground its change pill stands on,
   the queue still plays one pill per change above the figure, and the figure
   still lags. The stacked layout is the default and the five screens that use it
   are unchanged.

## Consequences

- The first top-edge pin a screen owns. The bar had one already and never said
  so, which is why a header could be written that paints behind it.
- `Header` gained a `pinned` prop and the screens pass it. It is a fact about
  the screen, not about the run, so no viewmodel carries it.
- The poll screen's coverage panel lost its `lg:top-4` pin. With the header
  pinned above it and the commit row pinned below, it was the third pinned edge
  on a screen holding one question — which is ADR-113 decision 4's own objection,
  arriving from the other side. It keeps its opaque ground and scrolls.
- `Header` returns a fragment when pinned, so `Screen`'s body — not the header —
  is the sticky row's containing block. Two specs that counted the body's
  children now count five, not four.
- The header breathes on the shop: pointing at an offer adds the after-install
  line and the slab grows with it. True before it pinned, more visible now.
