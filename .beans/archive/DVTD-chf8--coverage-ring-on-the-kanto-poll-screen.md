---
# DVTD-chf8
title: Coverage ring on the kanto poll screen
status: completed
type: feature
priority: normal
created_at: 2026-09-11T11:34:51Z
updated_at: 2026-09-11T11:44:18Z
---

A donut showing coverage held against the gate's demand, on the kanto poll
screen (which renders no coverage at all today). Ported from Marciano's mock.

The arc and the number both animate when coverage moves — up on a correct
answer, **down on a wrong one** (a miss bleeds `0.5 + 0.03 × gate` of the
per-correct earn off the meter, so the ring runs backwards as readily as
forwards).

## Geometry, measured off the mock

2x retina, halved: outer 68px (`size-17`), 8px stroke, arc from 12 o'clock
clockwise with round caps.

The cap style is provable rather than guessed: the arc measured 74.7% of the
circle where `148/210 = 70.5%`. The 4.2% gap is exactly two round line-caps —
half a stroke-width of arc at each end, 8px over a 377px mid-circumference.

```
viewBox="0 0 100 100"  cx=cy=50  r=44  strokeWidth=12
rotate(-90 50 50)
arc <circle pathLength="100" strokeDasharray="100"
            strokeDashoffset={100 - pct} strokeLinecap="round" />
```

`pathLength="100"` renormalises the path so the dash maths is literally
percent. Without it every dash value is tied to `2*pi*r`, and changing the
radius later silently desyncs the fill.

## Scale: rescale + demand tick, never clamp

Ports `CoverageGauge.ui.tsx:57-60`. ADR-061 decision 5: clamping made 5.3%
against a 3% demand look identical to exactly meeting it.

```
ceiling = max(demand, held)
pct     = ceiling <= 0 ? 0 : held / ceiling * 100
tick    = ceiling > demand ? demand / ceiling : none
```

## Animation: zero JS

All motion in this repo is already pure CSS, so `prefers-reduced-motion` stays
in the same @media block as the other six guards rather than needing a
matchMedia stub setup.ts does not have.

Arc transitions `stroke-dashoffset` (interpolates both directions for free).
Number rides `@property --coverage-count` read back through `counter()`. Both
read one shared `--coverage-duration` so they cannot drift. 400ms ease-out.

`counter()` renders integers only and coverage is fractional at early gates
(wiki: `1.2 / 3%`), so the property holds TENTHS and content is
`counter(whole) "." counter(tenth)`; whole values use a plain integer class so
148 never renders as 148.0. Animating glyphs are aria-hidden generated
content, so the exact value also ships as an sr-only span.

## Scope

Props: `{ held: number; demand: number; title: string; note?: string }`.
No pending ghost and no missAt in v1 — follow-up once the shape is proven.

## Todo

- [x] CoverageRing.ui.tsx
- [x] app.css: @property, the two transition blocks, reduced-motion guard
- [x] CoverageRing.spec.tsx (20 cases)
- [x] CoverageRing.stories.tsx (baseline, ladder, AcrossThemes)
- [x] Wire into PollScreen + kantoPoll.factory (drop header.coverage there)
- [x] ADR-068; ADR-061 decision 1 collapses to a pointer; README row
- [x] wiki section 8 still describes the header bar
- [x] CHANGELOG
- [x] Lint, typecheck, tests

## Summary of Changes

`CoverageRing` is the first SVG arc in the codebase and the first registered custom property. It adds no animation dependency and no `requestAnimationFrame` — all motion in the app is still CSS.

**Geometry.** `viewBox="0 0 100 100"`, `r=44`, `strokeWidth=12`, so the outer edge lands exactly on 50; `-rotate-90` puts 0 at 12 oclock. `pathLength="100"` renormalises the circle, so `strokeDashoffset={100 - pct}` is literally percent and the radius can change without desyncing the fill.

**Scale.** A full sweep means `max(demand, held)`. Past the demand the arc fills and a `<line>` tick marks where the demand fell — keeping ADR-061 decision 5s argument where its mechanism could not follow, since a circle has no room to open.

**Animation.** The arc transitions `stroke-dashoffset`; the digits transition a registered `--coverage-count` read back out through `counter-reset` / `counter()`. Both read one `--coverage-duration` (400ms), so a number cannot land before its arc. `@starting-style` makes arrival animate too. `prefers-reduced-motion` stops both.

Only the whole part counts — `counter()` renders integers, and a second animated counter for the tenth would run its digit backwards whenever the whole part ran forwards, so the tenth sits beside it as static text. The digits are generated content and therefore not in the DOM, so the ring carries `role="img"` with the full reading as its label, matching how `CoverageGauge` already announces itself.

**Wiring.** `PollScreen` gained `coverage?: CoverageRingProps`, drawn between the trail row and the question. The fixture reads `coverageDemandFor(SAMPLE_GATE)` rather than hardcoding — gate 9s demand is 210, which is exactly what the mock shows. A spec asserts coverage is stated exactly once per screen (ADR-061s rule).

Mock geometry was decoded from the PNG rather than eyeballed. The cap style is provable: the arc measured 74.7% of the circle where `148/210 = 70.5%`, and the 4.2% gap is exactly two round line-caps (half a stroke-width of arc at each end, 8px over a 377px mid-circumference).

Not built: the pending ghost and the miss projection (ADR-061 decisions 3 and 4). Follow-up once the shape is proven in play.

Verified: 4383 tests pass (245 files), `npm run lint` clean, `tsc --noEmit` exit 0.
