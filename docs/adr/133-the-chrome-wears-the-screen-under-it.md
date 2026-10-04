# ADR-133: The chrome wears the screen under it

## Status

Accepted — 2026-09-28 (Marciano, DVTD-lqtu). Reverses
[ADR-130](130-the-bar-carries-what-every-screen-needs.md) decision 9. Builds the
`<body>` theme [ADR-020](020-gate-theme-replaces-category-colors.md) decision 2
declared and never shipped.

## Context

The bar and the footer are the only surfaces drawn on every screen, and both sit
outside the screen they are drawn with. `AppNav` is a sibling above `<main>`;
`AppFooter` is a sibling of the `<Outlet/>` inside it. Neither is a descendant of
the `<section>` that carries a screen's theme, so neither could ever read it.

ADR-130 decision 9 dealt with that by pinning the bar pewter. It was the only
move available: the bar could not reach the screen's colour, and resolving
against the `:root` cerulean made its links a visibly blue grey. The footer got
no such pin and has been quietly resolving against that cerulean ever since.

The bar also painted its chrome on the neutral zinc roles — `bg-surface`,
`border-edge`, `bg-surface-raised`, `ring-edge-strong` — while every screen under
it painted on theme grounds. Two token systems, one of them visible on every
screen.

ADR-020 decision 2 said `Screen` mirrors its gate onto `<body>`, which would have
solved this in 2026-08. Nothing ever did it. `app.css` grew the
`body[data-gate-theme]` rules that mirror was meant to feed, and they never
fired.

## Decision

1. **The page theme is React state on the root, not a write to `document.body`.**
   `Screen` publishes its `theme`/`gate` through `PageThemeContext`;
   `RootDocument` holds the state and renders the attribute on `<body>` itself.

   The mirror ADR-020 described was an imperative `document.body` write. That was
   rejected on three counts. `Screen.spec.tsx` asserts in its own test name that
   a screen paints its ground rather than writing to the body. `.storybook/preview.tsx`
   states the house rule for exactly this shape: *"A wrapper rather than a side
   effect on `<body>`: the attributes go up and down with the story, so nothing
   leaks between the preview and the docs page."* And an effect cannot run before
   hydration, so the server would ship a bar with no theme and the `:root`
   cerulean would paint it — reintroducing, for hundreds of milliseconds on every
   cold load, the exact defect ADR-130 decision 9 exists to remove.

   React state has none of those problems. `<body>` renders with the theme on the
   server, no global is mutated, and a `Screen` with no provider above it — every
   story, every unit test — publishes into a no-op.

2. **An unthemed page is pewter, and that is decision 9 surviving as a default.**
   `pageThemeAttributes` falls back to `UNTHEMED_PAGE` when no screen has
   published. Login, `/admin` and the 404 have no `Screen`, and the
   pre-hydration frame of every page has no published theme either. All of them
   get the grey the bar wears today, so the first paint is the previous design
   rather than a flash of blue.

3. **One attribute at a time, never both.** `body[data-screen-theme]` is declared
   after `body[data-gate-theme]` in the sheet, so a mood left behind by the
   previous screen would silently beat a live gate. `pageThemeAttributes` returns
   one key or the other, which makes that unrepresentable rather than guarded.

4. **The bar paints on theme grounds.** `bg-surface → bg-theme-faint`,
   `border-edge → border-theme-faint`, `bg-surface-raised → bg-theme-raised`,
   `ring-edge-strong → ring-theme-soft` — the pairing `app.css` names in its own
   words where it says `raised` is the step `--color-surface-raised` names over
   `--color-surface`. The bar becomes the same chrome `Panel` already is.

   Decision 8's reading survives unchanged, because hover and active shared the
   same fill before this and still do: the discriminator was always the ring and
   the text rung, and the ring is now the one element in the bar carrying the
   gate hue at strength.

5. **The wrap keeps its black ground.** `<main>` is opaque `bg-zinc-950`, so a
   themed `<body>` shows only in the strip around the bar. Letting it through
   would put a tinted strip directly above a neutral page and split the two.
   Decision 8's "the mark stands beside it on the black ground" stays literally
   true, and the body tint rules stay invisible — they are fed correctly now, and
   what they paint is a question for whoever takes the page ground off zinc.

6. **The brand does not move.** `Logo` stays `brand-bone`/`brand-sand`, and the
   mark's `vermillion` and the count's `saffron` still pin themselves. An
   element's own `data-screen-theme` beats an ancestor's.

## Consequences

The footer follows the gate for the first time. It was already built from theme
utilities and was the only surface wearing the `:root` cerulean by accident
rather than by decision.

`Screen` calls a hook, which ADR-010 reads literally forbids in a `.ui.tsx`.
That clause means no *data* reach — no server functions, no TanStack Query — and
seven `.ui.tsx` files already hold React state or effects. ADR-010 is amended to
say so rather than leaving this as a silent exception.

Two `Screen`s mounted at once would fight over one page theme, last writer
winning. No route renders two today; `GateOutcomeScreen` and `RunOverScreen`
branch rather than stack, and `Modal` is `fixed inset-0` rather than a portal, so
it never leaves its theme ancestor. This makes that a load-bearing invariant that
nothing enforces.

A client route change lands the new theme one passive effect after paint.
`body` already carries `transition: background-color 700ms ease` and the bar's
items carry `transition-colors`, so it reads as a cross-fade. A layout effect
would close the gap and is the first thing to try if it does not.

`ALL_SWATCHES` reaches `AppNav.stories.tsx` as a runtime import, which the
stories carve-out in `.dependency-cruiser.cjs` permits and `Header.stories.tsx`
already does.
