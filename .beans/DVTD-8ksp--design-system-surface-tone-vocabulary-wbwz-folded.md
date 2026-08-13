---
# DVTD-8ksp
title: 'Design system: surface tone vocabulary (wbwz folded in)'
status: todo
type: task
priority: normal
created_at: 2026-08-13T08:24:01Z
updated_at: 2026-08-13T09:08:02Z
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
- [x] wbwz's text grays — done 2026-08-13, see below
- [ ] Add `ring-theme`; fix the `--succes` typo or delete the three dead aliases

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
