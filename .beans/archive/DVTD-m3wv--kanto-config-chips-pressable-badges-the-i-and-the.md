---
# DVTD-m3wv
title: 'Kanto config chips: pressable badges, the (i) and the info panel'
status: completed
type: feature
priority: normal
created_at: 2026-09-09T13:06:54Z
updated_at: 2026-09-09T14:18:55Z
---

Blue badges become controls (A/B arm toggle, lint/peek spends), every chip gains a trailing (i) that opens a detail panel. From five mocks.

Decisions: all three pieces one pass; pin state controlled from Tier 2 (no hooks in .ui); blue=pressable enforced in the type; three fill rungs (idle/armed/hover).

- [x] app.css: press-theme / press-theme-armed / press-theme-loud pairs + ring-theme-soft
- [x] Contrast check all four pairs across 12 hues, report worst ratio
- [x] Badge: XOR color|onPress, armed, disabled, hint; ring-1 ring-inset (no box growth)
- [x] Figures.ui.tsx: inline figure badges, saffron for decay not cinnabar
- [x] Weight.ui.tsx: one pip per slot (NOT terminal's fixed block)
- [x] VersionBars.ui.tsx: one dash per rung, nothing when maxVersion <= 1
- [x] ConfigInfo.ui.tsx: title/version/prose/note/divider/weight+sell footer
- [x] ConfigChip: badge press passthrough, (i) trigger, panel, infoOpen/onToggleInfo
- [x] Build + PollScreen: thread openInfo, one panel at a time
- [x] Stories for all, incl. mocks 361/362 reproduced
- [x] Specs for all
- [x] lint + typecheck (app + stories) + tests

## Summary of Changes

Four new kanto components, three modified, two new app.css utility pairs.

**app.css** — `press-theme` (idle), `press-theme-armed` (the live arm of a two-state control), `ring-theme-soft` (the affordance edge), plus `bg-theme-muted` as `text-theme-muted`'s background pair for the weight pips. Hover is **nested inside** the utilities rather than shipped as `hover:` variant classes: `.press-theme:hover:not(:disabled)` outranks the single class `.press-theme-armed`, so hovering an armed control reliably lights it. A flat set of three utilities would have left that to whichever Tailwind emitted last.

**Badge** — `color` and `onPress` are now mutually exclusive, so a green press or a decorative blue badge fails to compile. A pressable badge hardcodes `data-screen-theme="cerulean"`. The edge is `ring-1 ring-inset`, not `border`: a border would stand the badge 2px taller and reflow its chip the moment a badge gained a handler. A spec compares the geometry classes of a label and a press to hold that. `aria-pressed` is emitted only when `armed` is passed — on a one-shot spend it would announce "not pressed" on a button that was never a toggle.

**Figures** — inline figure badges for the panel prose. Tone cannot be read off the token: mock 362 paints `×3` as a gain and `×2` as a term in the same panel, so the caller passes `gain` to name which kind of sentence it is. A signed minus is always a loss.

**Weight** — one pip per slot, built from the mock (Telemetry 2 slots -> 2 pips, Deprecated 4 -> 4, both measured). Deliberately NOT a port of terminal's `Weight`, which draws one fixed-width block with a hue edge and a figure.

**VersionBars** — one dash per rung, filled to the current version, nothing at all when `maxVersion` is 1 (the panel says "no upgrades" instead, since one filled bar would read as room to grow).

**ConfigInfo** — the panel: title + version + rungs, effect prose, state note, divider, weight + sell footer.

**ConfigChip** — badge presses pass through, plus the `(i)` and the panel. Pin state is controlled (`infoOpen` / `onToggleInfo`); hover is pure CSS, so no hook enters a Tier-1 file. The panel is laid out but unpainted while shut rather than unmounted, so opening one never reflows the band, and it stays `aria-hidden` until pinned. A locked chip gets no `(i)`; a `lost` one keeps it.

**Build** — threads `openInfo` / `onToggleInfo`, keyed on the chip name. Holding one id in the parent rather than a flag per chip makes "only one panel open at a time" structural. `PollScreen` needed no change since it already spreads `build`.

### Contrast

Every pair was checked against all twelve Kanto hues. Text: `press-theme` 10.88:1 worst, `press-theme-armed` 7.02:1, hover 5.52:1 — all clear AA. The model reproduces `badge-theme`'s documented 7.8:1 exactly.

**One deliberate deviation from the mock.** Its ring measures L 0.467, which is 2.25:1 against its own fill — under the 3:1 WCAG asks of a control's boundary. Since an idle press sits at 1.12:1 against a decorative badge by fill alone, that ring is the *only* cue separating a control from a label, so it is pinned at L 0.56 (3.31:1 against the fill, 3.83:1 against the faintest screen ground). A spec asserts 0.56 and rejects 0.467. One-line revert if mock fidelity should win.

### Not from me

`Typography.ui.tsx` lost `display`'s `mb-5` on disk at 14:42 (an external edit during plan mode). Two `Typography.spec` tests asserting the margin were stale; they now assert that **no** variant ships a margin of its own, with the reason recorded.

Verified: `npm run lint` clean (887 modules, 3631 dependencies), `tsc --noEmit` clean, no kanto story type errors (30 pre-existing repo-wide, unchanged), `npm test` 213 files / 3689 passed (+68) / 6 skipped / 2 todo.

## Deferred

- **Wiring to Tier 2.** `toolsFor`, `swapFor` and `buildRows` in `PollView.component.tsx` are the mappers, but kanto has no container and `src/routes/` still mounts terminal.
- The pinned panel is positioned in normal flow, so a chip on the last row opens its panel below the fold. A top-layer popover would fix it but needs CSS anchor positioning.
- Coverage gauge and the payout reading, still cut.
- 30 pre-existing story type errors; `Swatch.stories.tsx` and `SwatchTrack.spec.tsx` still missing.

## Follow-up: chip surface, version bars, weight figure

Three same-session reversals from screenshots, per live-playtest-expect-reversals.

**Chip fill softened, edges neutral.** `bg-theme-soft` is an alpha of the theme colour at *full* chroma, so on a vermillion screen it composited to L 0.205 / C 0.067 and read as a row of red tiles. Swapped to `bg-theme-raised`: the same lightness (L 0.219) at **half the chroma** (C 0.031), which is the "keep the colour but softer" ask rather than merely darker. Chip, panel and divider edges moved from `border-theme-faint` to `border-edge` (L 0.274, C 0.006) — neutral, and within 0.03 L of what the mock's border actually measures. Hue now belongs to the badges and to state, never to the furniture.

Also fixed while in there: the (i) carried `ring-theme-faint`, which **does not exist** and emitted nothing, so the ring was falling back to `currentColor`. Now `ring-edge` / `hover:ring-edge-strong`.

**Version bars deleted.** "v2 of 2" already spells the ladder, so drawing it beside the words said the same thing twice. `VersionBars.ui.tsx` and its story and spec are removed rather than left dead — the panel was its only consumer. The `no upgrades` label survives for single-rung configs.

**Weight is a figure, not a row.** One pip per slot ran wider than the footer at 8 and 16 slots and wrapped "slots" onto a second line. `Weight` now renders `weight [n] slots` with the count as a `Badge`, so the mark's width no longer grows with the number — a spec asserts a 1-slot and a 16-slot weight have identical element counts. `bg-theme-muted` (added earlier this bean for the pips) is now unused by anything.

Verified: lint clean (884 modules, 3621 dependencies), tsc clean, no kanto story type errors, `npm test` 212 files / 3685 passed / 6 skipped / 2 todo.

## Follow-up 2: borders stay themed

Reverted the neutral-edge half of the previous entry. Chip, panel and divider are back on `border-theme-faint`; softening the *fill* was the whole fix, and `border-edge` also flattened the chips against the screen. `bg-theme-raised` stays.

Fixed properly this time: `ring-theme-faint` **now exists** in app.css as `border-theme-faint`'s ring pair. The (i) had been asking for that class before it was declared, which is a silent failure — Tailwind emits no rule, the ring keeps its default `currentColor`, and the result looks plausible on screen. A spec now asserts both that the button carries the class and that app.css declares the utility, so the same mistake cannot pass again.

`bg-theme-muted` is now unused by anything (it was added for the pip version of `Weight`). Left in place as `text-theme-muted`'s pair; flagged for removal if unused tokens are unwanted.

Verified: lint clean (884 modules, 3621 dependencies), tsc clean, no kanto story type errors, `npm test` 212 files / 3686 passed / 6 skipped / 2 todo.

## Follow-up 3: the pin, and the screen colour follows its gate

**The pin.** Clicking (i) now keeps the panel open, which matters because Tailwind wraps `group-hover` in `@media (hover: hover)` — verified by generating the sheet — so on a touch device the hover reveal never fires and the tap is the *only* way in. Three fixes:

- The shut and open class sets were **stacked**, applying `invisible` with `visible` and `opacity-0` with `opacity-100`. Tailwind emits `.visible` at line 304 and `.invisible` at 301, so the pin worked purely by source order, with nothing in the class list saying so. They are mutually exclusive now.
- A pinned panel takes pointer events back (`pointer-events-auto`). Without it a tap on the panel fell through to the chip underneath and its text could not be selected — a mobile-only failure.
- Every arg-driven ConfigChip story now goes through a `Pinnable` wrapper that owns the pin. Nothing wired `onToggleInfo` before, so the tap was inert in most stories; on desktop hover masked it, on mobile there was no way in at all.

**The screen colour was never derived from the gate.** `PollScreen` took `theme: KantoColor` alongside `header.swatch.theme: SwatchTheme`, and the two disagreed immediately: gate 11 is **Elite** and the `LateRun` story passed `fuchsia`, which is why Elite read as pink; gate 1 is **Boulder** and `FirstGate` passed `viridian`, which is why its screen glowed green.

`PollScreen` has **no `theme` prop** any more — it derives from the gate. `Screen` gained a gate arm (`{ theme } | { gate }`, mutually exclusive) that emits `data-gate-theme`, so it reads app.css's existing table directly. Deliberately not a TypeScript gate-name-to-colour map: the table also carries per-gate ground chroma (0.12 for the loud reds and blues, 0.18 for the pales) and Elite's indigo lightened to L 0.7, all of which a colour name drops. A spec asserts the table covers every gate in the roster.

**Boulder had no glow, and scaling could not give it one.** `--color-pewter` is `oklch(65.7% 0.006 229)`; the ground multiplies chroma by 0.25, so Boulder's screen came out at C 0.0015 — indistinguishable from black. Added `--theme-ground-floor: 0.02` and changed both ground utilities from `calc(c * factor)` to `max(c * factor, floor)`. Boulder now shows its H 229 as a cool slate, sitting just under the ~0.03 the chromatic gates land on, so it stays the quietest screen without being unthemed. Only pewter is affected in practice.

`PollScreen`'s `AcrossThemes` became `EveryGate`, and `Screen` gained one too, so a wrong gate colour is visible in one story instead of inferred.

Verified: lint clean (884 modules, 3623 dependencies), tsc clean, no kanto story type errors, `npm test` 212 files / 3706 passed / 6 skipped / 2 todo.
