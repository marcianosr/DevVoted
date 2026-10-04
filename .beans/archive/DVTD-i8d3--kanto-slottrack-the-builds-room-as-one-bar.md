---
# DVTD-i8d3
title: 'Kanto SlotTrack: the build''s room as one bar'
status: completed
type: feature
priority: normal
created_at: 2026-09-10T14:06:49Z
updated_at: 2026-09-10T14:20:57Z
---

The kanto build column shows room left in two places only: the header sentence
and a stack of full-width dashed SlotBox rows. Neither shows WHICH config eats
which room, so an 8-slot and a 1-slot config draw the same-sized row.

docs/wiki.md already prescribes the drawing and calls it the track: "a bar per
config as wide as its slots, one dashed box per slot still open, and a hatched
stub one slot wide at the end". kanto is the one kit that never drew it.

Plan: ~/.claude-work/plans/i-want-to-create-hidden-yeti.md

Marciano's calls: named SlotTrack and the caption says "the track" (the glossary
already spends "meter" on the gate's coverage score); the track is read-only and
ADDITIVE, so SlotBox/SlotOffer keep the cash and buy presses; the unbought box
gets a new fine hatch SIBLING, never a re-point; and the highlight follows hover
OR the chip whose info panel is open, so a phone reaches it by tapping (i).

Measured off both mocks (2x retina): 10px tall, 3px gap, 3px radius, each box
flexGrow = its slots. Filled box is badge-theme, which is Weight's exact paint,
so the track is the chips' weight blocks laid end to end.

- [x] bg-hatched-theme-fine in app.css, AFTER the original block
- [x] SlotTrack.ui.tsx + spec + stories
- [x] Compose into Build's slots arm; header gains free / over-by
- [x] ConfigChip highlighted edge + hover handlers
- [x] Fixtures in kantoPoll.factory for the .spec. files
- [x] Boy-scout: tighten SlotOffer.spec's three app.css indexOf calls
- [x] Wiki: the caption line's three duties in priority order
- [x] lint, typecheck, tests, stories typecheck, built-CSS grep

## Summary of Changes

One Tier-1 component, composed into `Build`'s shop reading above the chips it
describes. The rows keep their presses: this is additive.

**`SlotTrack.ui.tsx`** — a `flex h-2.5 gap-[3px]` row of `rounded-[3px]` boxes,
one per config, plus the line under it. `10px / 3px / 3px` are Marciano's mock
halved: both frames are 2x retina, which the 88px chip rows settle (44px CSS is
a chip; 88px is nothing).

**Every box states its width through `flexGrow`, and only through it.** The
first cut used Tailwind's `grow` for the one-slot boxes and an inline style for
the config boxes — identical rendering, but the row then said the same thing two
ways and a spec reading widths off the row got `0` for half of them. A private
`Box` is now the one place the property is set, which is what makes "the boxes
sum to capacity" a checkable invariant.

**`basis-0` is load-bearing.** Preflight sets `box-sizing: border-box`, so under
the default `flex-basis: auto` an open box's 1px dashed edge comes out 2px wider
than a filled box at the same slot count. Marciano's own CSS says `flex: 1`, and
the `0%` is the half that matters.

**Colours came off the mock and landed on rungs app.css already had**, converted
to oklch: the filled box measured L 0.360 C 0.063 and `badge-theme` is L 0.30 at
c x 0.3 (0.060 on cinnabar) — which is `Weight`'s exact paint, so the track *is*
the chips' weight blocks laid end to end, same fact at two scales. The lit box
measured L 0.626 C 0.193, i.e. the raw theme colour (`bg-theme`). The caption
measured L 0.462 C 0.041 against `text-theme-muted`'s L 0.47 / c x 0.2 = 0.040,
which is `Typography variant="hint"` exactly. No new colour was needed.

**A sub-1-slot config draws no box but is still named.** `slotsOf` floors a
minified 1-slot config to 0, and a zero-width box still costs the row a 3px gap.
The caption answers "takes 0 slots of 10" rather than going quiet. A locked chip
also draws no box: it withholds its width along with its name, and a box would
leak how much room the hidden thing takes.

**The row is `aria-hidden`.** Every number it draws is already in text — the band
carries the totals, the line carries the per-config cost — which is `SlotBox`'s
own argument for hiding its inert arm.

**`bg-hatched-theme-fine`** — a sibling, never a re-point, placed *after* the
original because `SlotOffer.spec` sliced the block with
`indexOf("@utility bg-hatched-theme")` and no trailing brace: a prefix-sharing
name placed above would have silently retargeted three passing specs onto the
wrong block. Those three now include the brace (boy-scout; my change is what
made them fragile). Geometry is the original's quartered — 3px lit in 6px,
measured 6px perpendicular off the mock — because a 24px period shows barely one
band on a box 10px tall and reads as a flat block. Colour construction and the
50% duty cycle are untouched.

**`ConfigChip`** — `highlighted` swaps the edge colour rather than adding a ring:
the chip already carries a 1px border, so nothing reflows. The colour had to come
*out* of the `CHIP` constant into a ternary — there is no tailwind-merge here, so
`border-theme-faint` and `border-theme` together would leave the winner to
Tailwind's emit order between two `@utility` rules. `onHover`/`onLeave` sit on
the chip span itself, not a wrapper: a `w-fit` wrapper once made every chip
max-content and overhung the column. A spec proves the placement by hovering the
chip element directly, since `mouseenter` does not bubble.

**`Build`** — `highlight ?? openInfo`, derived here because Build is the only
place holding both props. Tailwind gates `group-hover` behind
`@media (hover: hover)`, so a phone never fires a hover; the chip whose panel is
open stands in, making the `(i)` tap the touch route. `highlight`/`onHighlight`
live on the `slots` arm of `BuildCount`, so handing a poll band a highlight is a
compile error — the same guard `cash` and `offer` already get. The header gained
`· 3 free`, reading `· over by 2` past the cap, both off the two engine numbers
it already prints. `ShopScreen` needed no change: it spreads the whole
`BuildProps`.

Wiki: the line under the track now has three duties, so they are named in
precedence order (armed deal beats hover, because arming is a spend), and the
touch route is written down.

Verified: 3982 tests pass (224 files, +45), oxlint + depcruise clean, tsc clean,
prettier clean over the configured glob. Stories typecheck at the 30 pre-existing
errors with none in the new files. `gap-[3px]`, `rounded-[3px]`, `basis-0` and
`bg-hatched-theme-fine` all confirmed emitted in the built CSS, with the
`max(c * var(...))` spacing intact.

## Deliberately not done

- The numbered chips (`1  .ts`) in mock 408 — not part of the track, and
  `ConfigChip` has no position concept.
- Moving the cash/buy presses onto the track and retiring `SlotBox`/`SlotOffer`,
  which is what `docs/wiki.md` actually describes. Marciano chose additive.
- A visual over-capacity treatment. Under proportional `flexGrow` the boxes just
  thin out, so being over the cap is only readable in the header's `over by 2`.
  A cap tick (terminal's `CapMeter` has one) is the fix if that should show.
- A track on the poll band: the union has no `slots` there.
