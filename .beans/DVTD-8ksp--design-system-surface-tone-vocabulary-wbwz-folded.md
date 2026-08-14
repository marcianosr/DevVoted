---
# DVTD-8ksp
title: 'Design system: surface tone vocabulary (wbwz folded in)'
status: completed
type: task
priority: normal
created_at: 2026-08-13T08:24:01Z
updated_at: 2026-08-13T19:37:48Z
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
- [x] Design the neutral token set (resolve pewter-vs-Boulder, reconcile gray vs zinc)
- [x] Add the surface tone vocabulary
- [x] Collapse the divider to one role — retokened rather than extracted, see below
- [x] Collapse the panel border to one role — retokened rather than extracted, see below
- [x] The popover surface, duplicated exactly twice — now `FLOATING_SURFACE`
- [x] wbwz's text grays — done 2026-08-13, see below
- [x] Add `ring-theme`; deleted the three dead aliases

## Noted, not scheduled
- The `▾ rotate-180` chevron pair (SummaryDropdown.ui.tsx:35, `__root.tsx`:286). One site is a legacy nav route full of raw HTML.
- `TerminalPanel`'s `border-zinc-300`: the only use of that shade anywhere, 3-5 stops lighter than every other panel, and it has one consumer.
- `StorageGauge`'s hardcoded "Free tier" label, stale against ADR-030's plan ladder.
- `Title` renders `text-zinc-200` while `ParagraphTone.default` is `text-zinc-100` — the two disagree on "default foreground". `Subtitle`'s `className` escape hatch has zero callers.

## Text half done (2026-08-13)

The surface todos above are untouched; this covers the text ramp only.

**The ramp went from five levels to two.** It was `zinc-100` body, `zinc-200` Title, `zinc-400` muted/Subtitle, `zinc-500` faint, plus a separate `pewter` tone at 10 sites, with no rule for picking one. The `muted`/`faint` split was not a real distinction: only 9 files used both, and in 7 the choice was arbitrary (two interchangeable hint sentences in `ConfiguringScreen`, captions split at random in `GateRewardReport`).

Now: `default` (zinc-100) for anything meant to be read, `muted` (pewter) for everything stepped back from it.

**It was also an accessibility fix.** Measured against the page background, `faint` sat at **3.7:1**, under the 4.5:1 WCAG AA asks of normal text, and 20 call sites used it. Pewter is 5.7:1. Body stays at 16.3:1 and Title at 14.1:1 (Marciano's call: dimmed text only, so the value-vs-caption hierarchy survives).

**Naming:** `muted` kept as the surviving tone, `faint` and `pewter` deleted from `ParagraphTone` along with `lavender`, which was defined and never used. Deleting them first turned every stale call site into a compile error, which is what proved the sweep complete rather than nearly complete — 30 call sites across 15 files.

**Per-site calls the collapse forced:**
- `StatBadge` — its value was `zinc-500` while its own `Subtitle` label was `zinc-400`, so the number read dimmer than its caption. Label to pewter, value to the body token.
- `ShopScreen.planLabelTone` — locked rungs had a third tone, but the locked row already carries `opacity-60`, so the tone collapsed to two and the function lost a branch.
- `ScoreEquationChips` — the `+` operator was `text-white` and the `=` was `text-zinc-500`, in the same equation. Both are now one `OPERATOR_TONE`, so the numbers carry the colour and the scaffolding sits back.
- The five `faint`-as-off-state ternaries (`SlotUnlockRow`, `SwatchChips`, `ClimbToday`, `RunCommunity`, `AnswerResults`) were safe: their on-state is `default`, which stays bright, so the step survives.

**Bugs fixed on the way:**
- `Badge` — `aria-disabled:text-zinc-300` against a `text-pewter` resting state made a **disabled badge brighter than a live one**. Now dims via opacity, which needs no second gray.
- `RevealScore` — still used `text-green-400` / `text-red-400`, the last surviving fragment of the `difficultyStyles` second palette the bean was originally filed about. Now matches `ScoreEquationChips`' viridian/cinnabar, so the reveal and the answer screen cannot disagree about what a gain looks like.
- Four more off-palette text sites mapped to Kanto roles: `ErrorComponent` (red-600 → cinnabar), `FooterUI` link (blue-400 → cerulean), `Dropdown` (red-300 → cinnabar), `GameLoopExplainer` (yellow-500 → saffron).

**Label swaps:** `GameLoopExplainer`'s uppercase caption became `Subtitle`; two inline labels (`RunSummary` "Coverage score", `ScoreEquationChips` "Correct answer") became toned `Paragraph`s. `DataTable`'s column header and `Tabs`' inactive tab stayed raw markup and were only recoloured: both carry a hover state `Subtitle` does not model, and forcing it would have meant a nested element fighting for specificity.

**Deliberately left alone:** decorative glyphs at `zinc-500` (`FoldableRow`'s caret, `GateRewardReport`'s list markers) per Marciano's scope choice, and `Title`'s `zinc-200`.

**Still true after this pass:** `grep text-zinc` returns ~158 hits in `src/domains/`, `src/routes/` and `src/presentation/`. That is legacy Tier-2 awaiting DVTD-wj1t, not drift this pass introduced.

Verified: tsc clean, oxlint clean, 0 arch violations (529 modules), 1457 tests passing.

## Surface half done (2026-08-13)

Marciano's two calls, which is what the bean was blocked on:

1. **Name zinc's roles.** Surfaces are not part of the Kanto identity, so they
   stay zinc behind named tokens. Pewter keeps its two jobs (a text tone, and
   Boulder's gate accent) and never becomes a body colour.
2. **Dark-only.** Drop the light ramp rather than give every token two values.

### The tokens

```css
--color-surface:        var(--color-zinc-900);  /* panel fill        */
--color-surface-raised: var(--color-zinc-800);  /* popover, chip     */
--color-edge:           var(--color-zinc-800);  /* divider, rule     */
--color-edge-strong:    var(--color-zinc-700);  /* panel border      */
--color-control-edge:   var(--color-zinc-600);  /* clickable outline */
```

`control-edge` was not in the plan; it earned itself once the surfaces were
named, because `border-zinc-600` turned out to be one role at every site
(Button's neutral variant, RadioDot, ShopScreen's action pills, and the two
`border-gray-600` buttons). Hover brightening stays a raw shade at the call
site: it is a behaviour, not a role.

Semantic colours deliberately did NOT go here. An error border is
`border-cinnabar` — the same token the text tone already uses. The three
unprefixed aliases that squatted on that idea (`--error`, `--warning`,
`--succes`, sic) generated no utilities, had no consumers, and are deleted.
`ring-theme` added, so a focus ring can follow the gate instead of a fallback.

### 91 sites → 25, and the 25 are not surfaces

55 sites were exact-value matches, so they are provably zero visual change —
verified in the built CSS, where `--color-surface` resolves to
`oklch(21% .006 285.885)`, the same value `bg-zinc-900` emitted.

What remains raw is not drift: bar fills (`GainBar`, `StorageGauge`,
`PollOutcomeBar`, ClimbToday's track), status dots, hover brightening, and
`Voter`'s `ring-zinc-950`, which deliberately matches the page so avatars read
as cut out of it. Those are content and state, not surfaces, and giving them
surface tokens would have been the same mistake in a new coat.

### Pixels that did move, and why

Each is one visual role that had drifted to different shades:

- The `<hr>` divider was zinc-700 in ShopScreen and zinc-900 in AnswerResults
  while everything else used zinc-800. All at `--color-edge` now: ShopScreen's
  dims a step, AnswerResults' two brighten a step.
- `GateStakeReceipt`'s panel was the only one at zinc-600 → `edge-strong`.
- `TerminalPanel`'s `border-zinc-300` — the bean's own "3-5 stops lighter than
  every other panel, one consumer" — → `edge-strong`.

### The bug the dark-only call surfaced

`dark:` keys off `prefers-color-scheme`, **not** off `color-scheme`. So the
seven `X dark:Y` pairs (CatchBoundary ×3, Login, Auth ×2, plus the base layer)
served their *light* value to a visitor whose OS is set to light — on a page
that `__root.tsx` paints black regardless. `* { border-gray-200 }` was the worst
of them: any element with `border` and no colour got a near-white edge. All
seven collapsed to their dark value; no `dark:` variant remains in the app.

### Deviations

The bean asked for a divider primitive and a panel primitive. Neither was
built. `Stack divided` already covers the between-children rule, and the rest
are inline `<hr>`s and one-off boxes whose radius and padding genuinely differ;
a component would have had to take both as props and would have saved nothing.
Naming the colour was the whole of the actual problem — the shades were the
drift, not the markup. The one duplicate that *was* byte-identical (two
popovers) became `FLOATING_SURFACE` in the new `src/ui/surfaces.ts`.

### Verification

1480 passing across 118 files, tsc clean, oxlint clean, dependency-cruiser 0
violations (537 modules), production build green with every new utility present
in the output CSS.

### Left for later

- `GameLoopExplainer.component.tsx` renders raw HTML in a `.component.tsx`, an
  ADR-010 violation predating this pass. Retokened, not restructured.
- `Title` renders `text-zinc-200` while `ParagraphTone.default` is `text-zinc-100`
  — still disagreeing about "default foreground" (also DVTD-39k8's territory).
- `StorageGauge`'s hardcoded "Free tier", stale against ADR-030.
