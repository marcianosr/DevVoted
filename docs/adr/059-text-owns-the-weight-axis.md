# ADR-059: Text owns the weight axis

## Status

Accepted (2026-09-05, Marciano, DVTD-ak6k).
Applies [ADR-010](010-ui-layer-separation.md)'s Tier-1 rule to the glyphs that were
bypassing it.

## Context

The terminal theme thinned text by hanging a font-weight class off `Text`'s `className`,
and drew its separators and carets as raw `<span>`s that never reached `Text` at all. Both
routes let a Tailwind class decide something the component should own, and the kit already
carries the scar: `modern-theme/Text.ui.tsx` records a size token's baked-in weight
silently beating every `font-bold` an ancestor set, decided by source order.

## Decision 1: `thin` emits `font-normal`, not `font-thin`

`app.css` imports JetBrains Mono at 400, 500, 700 and 800 only. CSS font matching does not
synthesise lighter faces, so `font-thin` and `font-light` both resolve up to 400 — the
kit's `font-light` chip was already rendering at 400 while claiming 300. Because `body` is
pinned to `font-weight: bold`, 400 is what thinning looks like here, and `font-normal` is
the only class that says so honestly.

The variant is still named `thin`, because that names the intent at the call site; the
table is the single place that knows which face backs it. Importing a real 100 face was
rejected: it adds a font file for a step nobody can see against a 700 baseline, and Space
Mono, the theme's alternate, ships no face below 400 at all.

## Decision 2: the axis has one value and no default

`WEIGHT` holds `thin` alone, and `weight` has no default, unlike `size` and `tone`. When
`weight` is omitted cva emits no class at all, so the 36 call sites still passing
`className="font-bold"` keep byte-identical output and never enter a specificity tiebreak.

This is why the guarantee is "no class emitted" and not "the caller's class wins". The
latter is false in general: `font-extrabold` sits after `font-bold` in Tailwind's output,
so a future `heavy` value would silently beat every one of those 36 call sites. Any new
weight value must be checked against that ordering before it ships.

`tailwind-merge` was rejected. No `<Text className>` in the kit passes a conflicting
`text-*` utility, so it would put a runtime dependency behind a primitive used at 174 call
sites to fix a bug that does not exist, and it would preserve the double specification
this ADR removes.

## Decision 3: `Text` forwards `aria-hidden`

`aria-hidden` was accepted at eight call sites and dropped at all eight, because `Text`
has no rest spread and TypeScript exempts hyphenated JSX attributes from excess-property
checks. It is now an explicit `"aria-hidden"?: boolean` prop, not a spread of
`ComponentPropsWithoutRef<"span">`: `as` is polymorphic and already used as `p` and
`code`, so a span-shaped spread would be a lie, and typing it honestly needs a generic
component.

Five of those eight glyphs were carrying the only semantics at their spot — the `×` and
`✓` that distinguish a failed review row from a passed one, and the `→` that makes
"v1 → v2" read as *becomes*. Their `aria-hidden` is deleted rather than activated. The
three decorative dividers keep theirs and now work. Where a glyph must be both hidden and
meaningful, the pattern is `Trail.ui.tsx`: an `aria-hidden` mark beside an `sr-only`
sibling carrying the word.

## Decision 4: separators are `Text`, at `faint`

Every raw muted span in the kit now renders through `Text`. Separators take
`size="caption" tone="faint"`; the three disclosure carets take `tone="faint"` and keep
their `inline-block`, `transition-transform` and `group-open/*:rotate-90` in `className`,
with `size` left unset because they are base-size and `caption` would shrink them.

`faint` rather than a twelfth tone for `text-zinc-600`: four sites already drew separators
at `faint`, so this converges on the majority instead of naming a second achromatic value
token that would immediately raise "faint or dim?" with no answer.

## Consequences

- A `weight="thin"` on a wrapper `Text` thins nested `Text` children, since the weight
  inherits and the children emit no weight of their own. `StoragePlan.ui.tsx` nests them
  today; nothing there takes a weight yet.
- `Text.spec.tsx` is the terminal theme's first class-level test. The kit's only other
  coverage proves that stories render without throwing, so a wrong Tailwind class shipped
  green; the load-bearing assertion is that an omitted `weight` emits no `font-` class.
- Story args are not typechecked, because `tsconfig.json` excludes `*.stories.tsx` and cva
  emits nothing for an unknown variant value. A bad `weight` in a story fails silently,
  which is the second reason the guarantee lives in the spec.
- `text-zinc-600` survives in four state tables (redacted, unseen, undealt, version
  ceiling). Those are border-and-text combinations on chips, not text tones, and are out
  of the axis.
- The three carets would arguably be better served by a terminal `Caret.ui.tsx` mirroring
  the modern theme's, which already models a caret as a control rather than as text.
  Routing them through `Text` is what this change does; a dedicated primitive stays open.
