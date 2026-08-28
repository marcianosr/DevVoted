---
# DVTD-uzdu
title: Pipeline as a spot track
status: completed
type: feature
priority: high
created_at: 2026-08-27T15:26:07Z
updated_at: 2026-08-27T18:47:41Z
---

The pipeline rail draws one dashed cell per free spot, which says nothing about
which configs are taking the room. Marciano's mock (2026-08-27) draws it as a
track instead: one bar per installed config, width proportional to its spots, the
name inside, free spots as cells, and a caption naming what still fits.

That is what makes ADR-044 legible. "4 spots" is a number; a byte filling the whole
bar is the rule.

## The mock

    gates 0-3                          4 spots
    [   Cold Start   ][ .js ][  ][/////////////]
    a nibble is the biggest thing that fits

    gates 8-12               8 spots · a full byte
    [               Freemium                     ]
    a byte is the whole pipeline · nothing else fits alongside it

## Todo

- [x] `SpotTrack.ui.tsx` in modern-theme: variable-width segments, free cells, ungranted room, minified and over-capacity states
- [x] Caption naming the biggest grade that still fits, off the new `largestGradeFitting`
- [x] Spec (11 cases) + 8 stories priced off the real roster
- [x] Wired into ShopScreen and ConfiguringScreen, the two live pipeline panels
- [x] Verified: lint clean (784 modules), build clean, 2508 passed / 3 pre-existing failures

## Summary of Changes

`SpotTrack.ui.tsx` in modern-theme, with a spec (11 cases) and 8 stories.

**The track draws to a full byte, not to current capacity.** That is the design
point: "4 spots" is only interesting because it is half a byte, so the room a run
has not earned is drawn as dark cells rather than left off. A caller renting spots
passes its own `maxSpots` and the track widens.

**Five cell states**, each earning its own tone:
- installed — a bar as wide as the config's spots, name inside
- minified — same bar, dotted and dimmer (a squeezed file is still a file)
- free — dashed, one cell per spot, so the room stays countable
- ungranted — dark, present and not yours
- overflow — cinnabar, and only reachable by losing a filled rung

Widths are percentages rather than flex-grow, because a bar has to be exactly as
wide as its spots: growing would let a long name stretch a crumb past a nibble
beside it.

**The caption answers "what can I still install?"** rather than restating the
count the header already carries. `largestGradeFitting(spots)` is new in
`config.model.ts` and returns the grade; the kit owns only the sentence. That split
is forced by the island rule — modern-theme cannot import the domain at runtime —
and it lands in the right place anyway: the domain owns the grade-to-spots table,
presentation owns the wording.

**Wired into both live pipeline panels**, `ShopScreen.ui.tsx` and
`ConfiguringScreen.ui.tsx`, which already import the domain and so need no new
props — they call `spotsOf` and `largestGradeFitting` directly.

The story prices its bars off the real roster via `spotsOf`, so a story can never
show a width the engine would disagree with.

**Verification.** `npm run lint` clean (784 modules). `npm run build` clean.
`npx vitest run`: 2508 passed, 3 failed — the three pre-existing `RewardScreen`
copy assertions (DVTD-9dn0). The story typechecks under a scratchpad tsconfig with
the `*.stories.tsx` exclusion cleared.
