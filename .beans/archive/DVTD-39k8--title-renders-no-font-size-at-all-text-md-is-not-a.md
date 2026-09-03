---
# DVTD-39k8
title: Title renders no font size at all — text-md is not a Tailwind class
status: completed
type: bug
priority: normal
created_at: 2026-08-13T13:46:18Z
updated_at: 2026-08-13T19:55:24Z
parent: DVTD-82c4
---

`src/ui/typography/Title.component.tsx:16`:

```tsx
<Tag className={clsx("text-md tracking-tight text-zinc-200", className)}>
```

`text-md` does not exist. The Tailwind scale is `text-sm` / `text-base` / `text-lg`, no `--text-md` token is defined in the `@theme` block (`src/styles/app.css:95-119`), and `tailwind.config.mjs` sets only `content` and `darkMode`.

So **`Title` emits no font-size**, and `as="h1"`, `as="h2"` (7 sites) and `as="h3"` (4 sites) all render identically. The heading level is semantic only; it has no visual weight.

Measured consequence: **14 of 36 `<Title>` call sites pass a `className` override**, and 6 of 18 `<Subtitle>` sites do. Four of those overrides are tone, not size (`text-cinnabar` twice, `text-gradient-green`, `text-zinc-100`) — re-expressing in raw Tailwind what `Paragraph` models as `tone=`. For comparison, `Paragraph` has 162 call sites and 84 `className` overrides.

Related but separate: **DVTD-8ksp** notes that Title's `text-zinc-200` disagrees with `ParagraphTone.default`'s `text-zinc-100`, and that Subtitle's `className` escape hatch has zero callers. The tone half belongs there; this bean is the missing size scale.

## Todo

- [x] Give `Title` a real size scale tied to `as`, or an explicit `size` prop
- [x] Give `Title` and `Subtitle` the shared `tone` vocabulary
- [x] Remove the `className` overrides the two changes make redundant
- [x] Check the visual diff — every heading in the app changes size when this lands

## Priority re-graded (2026-08-13, same day it was filed)

High → normal. The dead class is real, but the symptom is **latent**: the app has been designed and playtested for weeks with `Title` at inherited size, so the current look *is* the intended look as far as anyone has experienced it. Nothing is visibly broken to a player, and no fix restores a known-good state — someone has to **decide** what the sizes should be, which makes this a design task with a defect at its root rather than a bug to repair.

The genuinely bug-shaped part is narrower: `as="h1"` and `as="h3"` are announced as different levels by a screen reader while rendering identically, so the heading hierarchy assistive tech reports does not match the one a sighted reader perceives. Real, mild, and the reason this stays on the list rather than being scrapped.

### Also affected, found while re-checking

`text-md` appears at **7 more sites**, all in `src/routes/__root.tsx` nav items (`:152, :160, :168, :177, :261, :268, :293`) — `className="... px-4 py-2 text-md hover:bg-gray-800"`. Same dead class, same silent no-op. That file is legacy Tier-2 markup awaiting **DVTD-wj1t**, so sweep it in the same pass or leave it to the migration, but do not fix `Title` alone and assume the class is gone.

Confirmed not defined: no `text-md` in `src/styles/app.css`, no `--text-md` token in its `@theme` block, and `tailwind.config.mjs` sets only `content` and `darkMode`.

## Summary of Changes (2026-08-13)

`Title` had no font-size at all. It does now, and the level it announces is the level it looks.

### The two decisions (Marciano, via AskUserQuestion)

1. **Size follows `as`.** No `size` prop: `h1` → `text-lg`, `h2` → `text-base`, `h3` → `text-sm`, with `font-semibold tracking-tight` on the cva base. Rejected: a separate `size` prop mirroring `Paragraph`, because it leaves announced-level ≠ perceived-level permanently possible, and that mismatch was the only genuinely bug-shaped part of this bean.
2. **Modest scale, 18 / 16 / 14.** Weight carries most of the hierarchy, so the deliberate typographic flattening of b4d33a2 (2026-08-01) survives. Rejected: 24/18/16, which would have meant re-eyeballing spacing on every screen.

### The shared tone vocabulary

`ParagraphTone` was a lie once three components used it. Extracted to **`src/ui/typography/textTone.ts`** as `TextTone` + `TEXT_TONE`, renamed across 10 consumer files. `Paragraph`, `Title` and `Subtitle` now read colour from one map. `Title`'s default moved zinc-200 → zinc-100, closing DVTD-8ksp's "the two disagree about default foreground" note. `AnswerResults` had its own local `TEXT_TONE`; renamed `CHIP_TEXT_TONE` so the shared one keeps the name.

`Subtitle` takes `tone` too, defaulting to `muted` — unchanged rendering, but a caption that carries meaning no longer needs a className.

### className overrides: 4 → 2

- `RunSummary` ×2 → `tone="gradient"` / `tone="cinnabar"`.
- `GateStakeReceipt` → `tone={swatchNameTone(...)}`. New `swatchNameTone(finish): TextTone` in `SwatchMark.component.tsx` is the single decision now; `swatchNameClass` derives from it (`TEXT_TONE[...]`) for the two call sites that are still raw spans.
- `TerminalPanel` lost its redundant `text-zinc-100`.
- The 2 that stay are letter-spacing and case, not colour or size: `TerminalPanel`'s `tracking-[0.3em]`, `GameLoopExplainer`'s `mb-4 uppercase tracking-wider`.

### The other 7 `text-md` sites

Swept `src/routes/__root.tsx`'s nav links to `text-base` — what the dead class was pretending to be and what those links already inherited, so provably zero visual change. `rg text-md src/` now returns only the word inside Title's own comment. That file is still legacy Tier-2 awaiting **DVTD-wj1t**; only the class name changed.

### Visual diff

31 `<Title>` call sites: 21 `h1` (16px/400 → 18px/600), 6 `h2` (weight only, 400 → 600), 4 `h3` (16px/400 → 14px/600). All 31 also go zinc-200 → zinc-100. No screenshot pass (per standing preference); verified instead that every utility `Title` now depends on is emitted in the production CSS — `text-lg`, `text-base`, `text-sm`, `font-semibold`, `text-zinc-100`, `text-cinnabar`, `text-gradient-green` all present, `text-md` absent as it always was.

### Also fixed on the way

`Title.stories.tsx` passed a `category` prop deleted back in ADR-020 — stories are excluded from tsconfig, so nothing caught it. Replaced with `Levels` and `Toned` stories. `Typography.stories.tsx`'s `ThemedTitle` claimed to be tinted cerulean while rendering a plain `Title`; it now is.

### No CHANGELOG entry

`text-md` arrived in b4d33a2 (2026-08-01), which lives on `epic/new-concept` only — no tag, not in `main`. Per `docs/changelog-maintenance.md`, a bug introduced in unreleased work was never experienced by a player and gets no `Fixed` entry.

### Verification

tsc clean, oxlint clean, dependency-cruiser 0 violations (538 modules), **1483 passing / 6 skipped / 2 todo across 118 files**, production build green.
