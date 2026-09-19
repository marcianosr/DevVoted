---
# DVTD-g8k8
title: 'Kanto prep screen: what a gate asks, bills and peels'
status: completed
type: feature
priority: normal
created_at: 2026-09-10T17:24:22Z
updated_at: 2026-09-10T17:40:36Z
---

Mocks #413/#414/#415: the screen before a gate's polls. Five sections (what it asks / the five polls / what it does to you / billed on a clear / how it ends) beside the build, in a sealed, a Prefetch and a gate-12 Champion reading. Plan: ~/.claude-work/plans/lets-design-the-shop-rippling-wren.md

Marciano's calls: Ledger is the repeated unit; #414 reveals all four poll rows (the engine gates them on one predicate); engine figures win over mock figures; the 413 leak is a per-poll row outside the total; the gate-4 frames draw a real gate-4 audit, not 402.

## Todos

- [x] Header: badge, swatchState, funds as amount/unit/label parts
- [x] Audit width, SlotTrack caption, Build occupancy track, Redaction short
- [x] Ledger.ui.tsx + Meter.ui.tsx
- [x] PrepScreen.ui.tsx
- [x] Factory: fundsOf, kantoPrepAt, the five ledger builders
- [x] Stories: Sealed, Prefetched, Champion, CalibrationGate, FatalMiss, WithPanels
- [x] Specs: new three + extend Header/Audit/SlotTrack/Build/Redaction; migrate funds assertions
- [x] lint + tests + build + stories typecheck + prettier

## Summary of Changes

**Three new Tier-1 pieces.** `Ledger.ui.tsx` is the screen's repeated unit — a title, an optional credit badge, a panel of label-and-figure rows, an optional bar and a closing note — and it draws four of the five sections. `Meter.ui.tsx` is the coverage bar (aria-hidden: the row above always prints both numbers). `PrepScreen.ui.tsx` composes Header, the build column with its one press back to the shop, and the five sections; a private `Section` gives the audits band the same heading rung Ledger uses for its own.

**A figure has four drawings and one of them is a redaction.** `LedgerFigure` is `Redactable`, so a withheld figure loses its colour and its swatch along with its label — a badge that kept its hue would leak which category was coming. The `???` vs `?` choice is **derived, not passed**: a row with one figure withholds a whole value, a row with five withholds one item of a list whose length is already public. `Redaction` gained `short` so both tokens stay in one place.

**Six small kit extensions.** Header: `badge` (`1 audit`), `swatchState` (a prep gate is unearned, so its lead swatch is the outlined arm), and `funds` split into `{ amount, unit, label }`. Audit: `width`, because a poll band wraps its audits into a row while a prep column stacks them. SlotTrack: `caption`. Build: `track: "configs" | "occupancy"` — a prep screen cannot rearrange the build, so its bar answers how full it is as one merged fill with no config to hover.

**The funds change fixed a real bug I shipped yesterday.** `amount` was a number printed over a hardcoded `KB`, so mock #415's `1.9 MB balance` would have read `1945 KB`. `fundsOf` now splits `kbLabel` on its one space, and as a knock-on the poll screen's 1843 KB balance reads `1.8 MB` — the same rolling every other storage figure in the kit already does. The stories typecheck (the only pass that sees story files) caught two more `funds` call sites the build cannot.

**Almost every figure reproduces from the engine, which is how the mocks were checked.** `coverageDemandFor(4)` is 60 and `(12)` is 375. `gateClearPayout` at gate 4 is exactly the mock's +160 KB. Seven occupied slots at a quarter share is `ceil(1.75)` = 2, and `peelConfigRangeFor` turns that into "peels 1 or 2 configs" — a 4-slot config settles it alone, two 1-slot configs settle it together. At the summit `410 Gone` adds 0.15 to 0.35, so `ceil(24 x 0.5)` is the mock's 12 slots, and the note credits the audit that deepened it. The 413 leak is `8 KB x (24 - 12)`. Fatality comes from the domain's own `isPeelFatal`.

**Four divergences from the mocks, all deliberate.**

1. **The gate-4 frames draw 429 Too Many Requests, not 402.** 402 is gate 3's intro audit and is excluded from gate 4's pool, so no seeded schedule can put it there. Gate 12's 408/410/413 trio needed no change: it is literally what `VICTORY_GATE` pins.
2. **The Champion window is open.** #415 shows revealed poll rows and a `Prefetch` credit over a build with no Prefetch in it, and its nine configs already fill all 24 slots. Prefetch takes the other 4-slot config's place, so the frame keeps its width and its reveal.
3. **The 413 leak sits outside the total.** It is charged per answer, not on the clear, so the row says `8 KB a slot past 12, each poll` and the total sums only what a clear bills.
4. **Freemium bills what the engine says.** #415's -128 KB is Freemium's *gate-4* figure; at gate 12 it doubles to 32768 KB, far past the 1.9 MB the run holds, so the ledger shows the engine's number and the shortfall warning the domain already owns ("what you cannot pay lapses"). Filed as **DVTD-s04t** — a subscription that doubles for twelve gates is unpayable from about gate 8, which is a balance question rather than a screen one.

Six stories: Sealed (#413), Prefetched (#414), Champion (#415), CalibrationGate (gate 0, where a miss costs nothing), FatalMiss (a one-slot build at the summit, where the peel takes everything), and WithPanels.

Marciano's two notes needed no code: the mocks paint every track swatch in the screen's colour, and `SwatchTrack` + `trackTo` already give each gate its own hue; Champion is prismatic because `Swatch` already draws `finish: "fill"` as `bg-legendary` / `legendary-ring` and withholds `data-swatch-theme` entirely.

## Verified

tsc clean, oxlint clean (one pre-existing Screen.stories warning), depcruise 0 violations over 948 modules, **4156 tests pass in 233 files** (+54; kanto-theme alone 785 in 39), build clean, stories typecheck back at exactly the 30-error baseline with none in touched files, prettier clean across src/ui/kanto-theme and the factory.

## Not done

Storybook-only, like every kanto screen. No Start press on the screen: the mocks show none, and the run's own start control is the shop's Continue footer (DVTD-b9xx). The five polls' window contents are fixture data rather than derived, since a fixture has no polls to read; every figure *about* the gate is derived.
