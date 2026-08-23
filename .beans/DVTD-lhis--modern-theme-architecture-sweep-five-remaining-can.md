---
# DVTD-lhis
title: 'modern-theme architecture sweep: five remaining candidates'
status: todo
type: epic
priority: normal
created_at: 2026-08-23T19:19:23Z
updated_at: 2026-08-23T20:08:28Z
---

An architecture sweep of `src/ui/modern-theme/` on 2026-08-23 found six deepening
opportunities. Candidate 1 (the gate ladder) shipped as DVTD-7fm9. The other five,
kept findable rather than lost in a transcript:

**2. The tone vocabulary is 21 separate declarations.** `MODERN_TONE` (tones.ts)
has only two consumers (Text, Code); Chip, Dot, Letter, Verdict and 14
state-keyed records each re-encode the same palette. `muted` resolves to five
different things. A `Letter` cannot be saffron, so a partial answer has no letter
state. `format.ts:1-3` documents the workaround out loud. Largest test-surface
win: 212 assertions across 41 of 47 spec files reach past the interface
(`toHaveClass`, `querySelector`, `parentElement`, `closest`) because states like
"gain vs loss" and "not yours yet" exist only as colours.

**3. Five independent `<details>` implementations** — Fold, Control, Entry, Pick,
Verdict, each with its own summary reset and group name. Entry.ui.tsx:83-92 and
Pick.ui.tsx:126-135 are byte-identical. PriceTag imports only Text yet three of
its class strings need a `group/entry` ancestor, and it calls
`closest("details")` directly.

**4. The screen shell is copy-pasted seven times** — `"flex flex-col
bg-theme-faint"` plus an inlined `data-gate-theme`, and `theme?: string` is
unchecked against the 13 valid values (which is how `theme="saffron"` shipped).
Matters most at wiring time.

**5. Three primitives have zero real call sites** — Control (104 lines), Coverage
(49), PriceTag (79) render only from stories. Lock duplicates Glyph's `readonly`
path. Filter and Tabs have structurally identical item types. Deletion test says
delete or collapse, not deepen.

**6. The data-versus-formatted-string seam is inconsistent** — ShopScreen takes
`offerCount: ReactNode` ("5 offers") beside an `offers` array of length 5;
StartScreen derives the same kind of count and comments on why. PrepScreen
hardcodes a plural at :190 and uses `plural()` at :334.


## Progress

**Candidate 4 done** (2026-08-23). New `Screen.ui.tsx` owns the shell; all seven in-run screens dropped their private `SCREEN` const and their inlined `data-gate-theme`. `theme?: string` became `theme?: SwatchTheme` (type-only import, allowed in `.ui.tsx`), which immediately caught three widened fixtures in specs and stories. `PollScreen.stories` `gateStory` collapsed from `(gate, name, theme)` to `(gate)`, reading name and colour off `GATE_SWATCHES`, so 13 call sites lost their restated strings.

Still open: 2 (tone vocabulary), 3 (five disclosures), 5 (uncalled primitives), 6 (formatted-string seam).
