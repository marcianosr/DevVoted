---
# DVTD-xsrz
title: Port the one-meter mock's presentation onto spots
status: completed
type: feature
priority: high
created_at: 2026-08-27T19:35:03Z
updated_at: 2026-08-27T19:50:03Z
---

Marciano re-shared the original Part B mock (image #30) — the one-meter model, where a config's price IS its size in KB. ADR-044 replaced that model, but the mock carries presentation ideas that survive the unit change untouched, and the build is missing them. Decision: keep ADR-044, port the presentation.

## What the mock has that the build lacks

1. **The deal prices nothing.** Every mock row carries a size, and AGENTS.md is dimmed with `needs 512`. Ours shows a glyph and a rate; you can tick a byte into a 4-spot pipeline and only learn it does not fit from the caption. Pillar 2.
2. **The shop's refusal is hover-only.** `offerRefusalText` exists but lives in a Tooltip. The mock puts it inline where the odds go.
3. **No way-out line.** The mock's amber line names the fix: "Freemium needs 512 KB · minify Prefetch to 128, or move to a bigger plan". Our caption says "full · minify or uninstall", naming no config and forgetting the plan exists.
4. **Plan rungs do not say what they hold** ("holds a byte too", "holds two bytes"). Exactly right for a rung that grants spots.
5. **Stack cards do not state the shape.**

## Two places the mock cannot be followed literally

- **Its three stacks are all 8 spots** (a byte / eight bits / a nibble and four bits). The ADR-044 opening is **4**. And all eight configs in our three stacks are bits, so all three stacks are 3 spots — identical shapes. "All in / Wide / Balanced" cannot be truthful without changing contents, and the contents carry dated decisions. So: the card states the true shape now, and re-composing is a separate call.
- **The odds column** (`1 in 3`, `1 in 25`) stays out until the weighted draw lands (DVTD-5ljh). The draw is a uniform shuffle; printing odds would be a lie.
- **The segment legend** ("configs 448 KB · rebuild leftovers 8 KB · free 56 KB") is dropped: residue died with the one-meter model, so the bar has two kinds left and the header plus caption already state both numbers.

## Todo

- [x] `Pick` gains `disabled` (dims the row, un-ticks the control, keeps the disclosure open-able)
- [x] Deal rows: spots column, and the refusal in place of the rate when it will not fit
- [x] Stack cards state the shape they make
- [x] Shop offer rows: refusal inline, not only on hover
- [x] Shop: the amber way-out line, naming a minify target and the plan
- [x] Plan rungs: what the extra room holds, derived from addsSpots
- [x] Specs + stories
- [x] lint, build, test

## Summary of Changes

Five presentation ideas lifted off the one-meter mock and rebuilt in spots.

**1. The deal prices every row, and refuses what will not fit.** `DealFigures`
gives each row two fixed right-hand columns: what it pays, then what it costs
(`4 spots`). A config bigger than the free room spends the first column saying
`needs a nibble` and the row dims and stops responding. The grade name rather
than a count, because the grade is the vocabulary the glyph has been teaching.

This needed `Pick` to gain `disabled`: it dims the row, disables the control and
drops the hover wash (hover promises the click will land), but leaves the
disclosure open-able, since a config you cannot take is exactly the one you want
to read about. The name-click still ticks without folding, unchanged.

**2. Stack cards state the shape.** New `shapeOf` in the domain names a build in
grade vocabulary: `three bits`, `a byte and two bits`, biggest grade first. The
card reads `three bits · 1 spare`.

**3. The shop's refusal came out of the tooltip.** The offer chip's corner badge
now names whatever is binding: `needs a byte` when room is short, the KB price
otherwise. A price you cannot pay is already answered by the storage figure in
the header; no-room was invisible without saying it.

**4. The amber way-out line.** `roomAdvice` names the blocked config and a fix
that would actually work: the cheapest single minify whose saving covers the
shortfall, and a bigger plan only when a rung's `addsSpots` covers it too.
Uninstall is the fallback rather than one option among several, so it never
buries a cheaper fix. This is stricter than the mock, whose own line advised
minifying Prefetch to 128 when that still left the build 328 KB short.

**5. Plan rungs say what they hold** — `holds a nibble too`, `holds a byte too`,
`holds 2 bytes` — derived from `addsSpots` via `largestGradeFitting`, so a
retuned ladder cannot leave the copy behind.

## Deliberately not ported

- **The odds column** (`1 in 3`, `1 in 25`). The draw is still a uniform shuffle
  (DVTD-5ljh), so those figures would be false.
- **The segment legend** (`configs 448 KB · rebuild leftovers 8 KB · free 56 KB`).
  Residue died with the one-meter model, leaving two segment kinds, both of whose
  numbers the header and caption already state.
- **The mock's three stack shapes** (a byte / eight bits / a nibble and four
  bits). They are all 8 spots and the ADR-044 opening is 4. Separately, all eight
  configs across our three stacks are bits, so all three stacks are 3 spots —
  identical shapes. `shapeOf` reports that honestly instead of the card claiming
  a difference the contents do not have. Re-composing them is DVTD-fkpa.

## Also

`SPOTS_PER_GRADE` exported so the two screen stories price rows off the grade
they declare rather than hand-writing both. Retired grade words (`Common`,
`Rare`, `Legendary`) cleaned out of the StartScreen story summaries.

## Verification

`npm run lint` clean (783 modules, 3225 dependencies) · `npm run build` clean ·
`npx vitest run` **2531 passed, 3 failed** — the three being the documented
`RewardScreen` copy baseline (DVTD-9dn0). Up 19 tests. Stories typecheck under a
scratchpad tsconfig clearing the exclusion; the only story errors left are the
pre-existing `modules/run/run/presentation/PrepScreen.stories.tsx` rot.
