---
# DVTD-dr5y
title: A perfect clear marks its swatch
status: todo
type: feature
priority: low
created_at: 2026-09-12T15:34:21Z
updated_at: 2026-09-12T15:34:21Z
---

ADR-075 made a gate closed at 100% coverage a distinct outcome that pays a
bonus, but it wins the same swatch as a healthy clear. An old prep-screen mock
had it "come out prismatic". Worth doing; not worth doing the obvious way.

## The trap

**Do not flip `GateSwatch.finish` to `"fill"`.** `swatch.model.ts` documents
`fill` as "the Kanto gradient, which has no single colour at all", and it exists
for one reason: 13 gates against 12 palette colours, so Champion alone wears the
gradient. `hasThemeColor()` returns false for it, `themeColorOf()` returns
undefined, and screens theme themselves off `swatch.theme`. A prismatic Pallet
swatch would strip the Pallet screen of its colour.

## The shape that works

A separate earned flag, not a finish. `.legendary-ring` (app.css) is already a
border ring that composes *over* an existing background, so a marked swatch
keeps its theme and its fill and gains a ring.

## Todo

- [ ] Decide where "this gate closed perfect" is recorded in run state, and
      whether it persists past the run into the collection surface
- [ ] Add the flag to `SwatchFill` in `Swatch.ui.tsx`; `.legendary-ring` over the
      normal themed fill, not instead of it
- [ ] Story + spec for a marked swatch at each `SwatchSize`
- [ ] Decide whether `SwatchTrack` and the collection surface show the mark, or
      only the gate-clear debrief
- [ ] State it in ADR-075's "The swatch is untouched" consequence, which this
      would reverse
