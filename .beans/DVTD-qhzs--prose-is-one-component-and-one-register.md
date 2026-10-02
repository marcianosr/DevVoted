---
# DVTD-qhzs
title: Prose is one component and one register
status: completed
type: task
priority: normal
created_at: 2026-10-01T15:17:59Z
updated_at: 2026-10-01T15:41:15Z
---

**What:** One `Prose` component states every explanatory sentence in the game, and `Figures` becomes the single string renderer behind both `Prose` and `Lead`.

**Why:** The same kind of sentence renders three ways today — the config panel badges its figures, the shop service row never reaches the parser, and the prep caption sits tighter than both — so a number reads as a number on one screen and as a word on the next.

## Done when

- [x] A sentence of player-facing prose reads the same on the config panel, the shop service row and the prep stake panel
- [x] A figure written inside any of those sentences wears a badge
- [x] A sentence states itself through one component, not a class string each screen writes again
- [x] A shop row that cannot be pressed still dims its sentence with the rest of the row
- [x] The decision is recorded and the changelog states what the player will see

## Summary of Changes

`Prose.ui.tsx` is the new kit primitive: it takes the sentence as a string, runs it through `Figures` and wraps the result in `Typography`. It takes `as` (a service row renders inside a press, where a paragraph is not valid content) and `gain` (a sentence stating a term paints saffron), and no variant, because there is one register.

`Typography` gained a `prose` variant — `text-xs`, `leading-relaxed`, muted — so no view writes a font class for a sentence any more. `hint` keeps its tighter leading; the two are different registers and merging them would have re-spaced thirty call sites to settle three.

`Lead` now renders a string part through `Figures` instead of a bare span. A string holding no figure splits into one part, so this is identical output everywhere except a string already carrying a figure, which was rendering it bare against ADR-066.

The three surfaces: the config panel dropped both of its hand-rolled class constants, the shop service row stopped handing a raw string to a hint, and the stake panel's earns line asks for the prose register. Two file-private components called `Prose` were renamed to say what they do — `CodeSpans` and `FactText`.

Recorded in ADR-162 with a changelog entry. Verified: 5272 tests pass across 284 files, typecheck clean, no dependency violations, and screenshots of the shop, prep and config panels confirm one register with locked rows still dimming.

## Follow-ups

Nine plain note lines still render a raw string and are the remaining ADR-066 gap: `Ledger`, `WarmBoot`, `DexPanel`, `ProfileRecord`, `ApprovalList`, `SlaPicker`, `LedgerRows`, `ProfileCollection` and `BandOutcomes`' footer. `RegistryControl`'s unlock and carry trailing (`352 KB short`) also states a figure bare.
