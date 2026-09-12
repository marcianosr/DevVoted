# ADR-068: Coverage reads as a ring on the kanto poll screen

## Status

Accepted — 2026-09-11 (DVTD-chf8, placement revised same day by DVTD-shaa).
Replaces ADR-061's decision 1 for the kanto kit; the vertical gauge that ADR-061
describes still ships in `terminal-theme`.

**Amended 2026-09-12 by [ADR-070](070-coverage-reads-as-a-banded-bar.md)**: the
poll screen takes the banded bar, because a ring draws one number against one
demand and the gate now asks four. The ring, its stories and `Header`'s support
for it all stand; decisions 1 (coverage appears once, enforced by the type) and
4 (the count-up is CSS, no rAF) are what 070 builds on.

## Context

The kanto poll screen drew no coverage at all. `Header` could carry a readout
and a `Meter`, but `PollScreen` never passed one, so the screen the player
answers on showed neither the score nor the bar it is judged against.

ADR-061 put a vertical gauge in the left gutter. The kanto poll screen is one
column (no sidebar, no gutter), so that placement has nowhere to go.

## Decision

1. `CoverageRing` is a donut with the coverage held at its centre and the gate's
   demand under it. It rides inside `Header`, as a tall leading element beside
   the title and track rows. Coverage appears exactly once per screen, and
   `HeaderProps` now enforces that with a union: a header takes `ring` or
   `coverage`, never both. ADR-061's rule, made unbreakable.

   Its caption is optional. Given neither `title` nor `note` it draws the bare
   dial, which is what the poll header wants: the gate is already named one
   line to the right.

2. The arc starts at 12 o'clock, sweeps clockwise, and wears `stroke-theme`.
   `pathLength="100"` renormalises the circle so the dash offset is literally
   percent: the radius can change without desyncing the fill, and no `2πr`
   constant appears anywhere.

3. A full sweep means `max(demand, held)`, not the demand. Past the demand the
   arc fills and a tick marks where the demand fell. This keeps ADR-061's
   argument — 5.3% against a 3% demand must not look identical to exactly
   meeting it — where its mechanism could not follow: a circle has no room to
   open the way a linear track does.

4. The arc and the digits animate, and both run backwards as readily as
   forwards, because a wrong answer bleeds coverage off the meter. Both are
   CSS: the arc transitions `stroke-dashoffset`, the digits transition a
   registered `--coverage-count` read back out through `counter()`. They share
   one `--coverage-duration` so a number cannot land before its arc and read as
   two separate readouts. `@starting-style` makes arrival animate too, and
   `prefers-reduced-motion` stops both.

5. Only the whole part of the reading counts; a tenth sits beside it as static
   text. `counter()` renders integers, and a second animated counter for the
   tenth would run its digit backwards whenever the whole part ran forwards.

## Consequences

This is the first SVG arc in the codebase — every other progress indicator is a
div with an inline `width: N%` — and the first registered custom property. It
adds no animation dependency and no `requestAnimationFrame`: all motion in the
app is still CSS.

The digits are generated content, so they are not in the DOM. The ring carries
`role="img"` with the full reading as its label, which is how `CoverageGauge`
already announces itself.

No pending ghost and no miss projection yet — ADR-061 decisions 3 and 4 have no
ring equivalent until the shape is proven in play.
