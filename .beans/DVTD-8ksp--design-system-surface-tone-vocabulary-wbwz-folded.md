---
# DVTD-8ksp
title: 'Design system: surface tone vocabulary (wbwz folded in)'
status: todo
type: task
created_at: 2026-08-13T08:24:01Z
updated_at: 2026-08-13T08:24:01Z
parent: DVTD-82c4
---

The surface half of the design system, plus the text half from DVTD-wbwz folded in (Marciano, 2026-08-13: settle both palettes together so the ~42 files are touched once).

`ParagraphTone` has 13 tones for text and none for surfaces, so 128 raw palette classes sit across 42 `.ui.tsx` files: `border-zinc-700` (17), `border-zinc-800` (11), `border-zinc-600` (3), plus 500/900/400/300, and 8 background shades.

## Blocked on a decision first: there is no dark-surface neutral

The Kanto palette's only neutral is `pewter`, it is mid-grey, and it is **also Boulder's gate theme** (`--theme-color: var(--color-pewter)`). So wbwz's "replace text-zinc-* with text-pewter" would make body text match one gate's accent. The token set has to be designed before either half ships.

Also unresolved:
- `app.css @layer base` still sets a light-mode-first **gray** ramp (`* { @apply border-gray-200 dark:border-gray-800 }`) under the `zinc` every component overrides it with. Two neutral ramps, one app.
- `--error` / `--warning` / `--succes` exist but are not `--color-*` prefixed, so Tailwind generates no utilities for them. They are dead, and `--succes` is a typo. Natural home for a semantic surface set.
- There is no `ring-theme` utility, which is why `ring-zinc-950` / `ring-zinc-900` fallbacks exist.

## Models to build on

`src/ui/rarityColors.ts` already has the `{ border, text, bg }` shape a surface token needs and is built on Kanto tokens. `Badge`'s `neutral` tone (`border-2 border-pewter bg-black text-pewter`) is the one place a surface is already expressed in a token.

## Todo
- [ ] Design the neutral token set (resolve pewter-vs-Boulder, reconcile gray vs zinc)
- [ ] Add the surface tone vocabulary
- [ ] Extract the divider/rule primitive: `border-t border-zinc-{700,800,900}` at 8 sites, 3 shades for one visual role
- [ ] Extract the panel border: 9 sites, radius varies rounded/md/lg/xl, border varies 600/700/800
- [ ] The popover surface, duplicated exactly twice (ConfigActions.ui.tsx:34, SummaryDropdown.ui.tsx:39)
- [ ] wbwz's text grays, once the target colour is settled
- [ ] Add `ring-theme`; fix the `--succes` typo or delete the three dead aliases

## Noted, not scheduled
- The `▾ rotate-180` chevron pair (SummaryDropdown.ui.tsx:35, `__root.tsx`:286). One site is a legacy nav route full of raw HTML.
- `TerminalPanel`'s `border-zinc-300`: the only use of that shade anywhere, 3-5 stops lighter than every other panel, and it has one consumer.
- `StorageGauge`'s hardcoded "Free tier" label, stale against ADR-030's plan ladder.
- `Title` renders `text-zinc-200` while `ParagraphTone.default` is `text-zinc-100` — the two disagree on "default foreground". `Subtitle`'s `className` escape hatch has zero callers.
