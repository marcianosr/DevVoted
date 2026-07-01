# ADR 004: UI Styling & Presentational-Reuse Conventions

**Status:** Accepted  
**Deciders:** Marciano  
**Date:** 2026-07-01  
**Relates to:** ADR-002 (domain architecture) — extends the two-tier UI split with concrete styling rules

---

## Context and Problem Statement

The flow redesign (poll answering screen) surfaced recurring drift in how presentational code is written:

- **Reimplementation over reuse.** The active-config strip hand-rolled a rarity-tinted card that already existed as `ConfigCard`'s `small` variant. Two other places (`ExposedConfigDeckDisplay`, the strip) each grew their own near-duplicate mini-card.
- **Foreign fonts.** A `font-mono` class crept in, applying Tailwind's generic monospace stack instead of the app's fonts. A dead `pixel` class (never defined in CSS) was also introduced.
- **Arbitrary sizes.** Hardcoded pixel sizes (`text-[10px]`, `text-[8px]`) bypassed the Tailwind type scale, producing off-scale text that can't be reasoned about consistently.
- **Large inline JSX.** Empty-state and label markup sat inline instead of being named, hurting readability.

These are small individually but compound into an inconsistent, hard-to-maintain UI layer.

---

## Decision

### 1. Reuse presentational components; never reimplement

Before writing a new visual, check `src/ui/` (and `src/ui/{domain}/`) for an existing component. If a variant is missing, **add the variant to the shared component once** and consume it everywhere — do not copy its markup.

- Rarity-tinted cards → `src/ui/economy/ConfigCard.ui.tsx` (single source of card markup).
- Domain wrappers (`ConfigCard.component.tsx`, `ShopCard`, `ActiveCard`) map their `Config` data to the shared UI card's plain props and add only their own concerns (install/deinstall buttons, cost formatting).

### 2. Fonts: app fonts only

Use only the fonts declared in `app.css` — Pixter Display (default `body` font) and, where explicitly needed, `--font` (Fira Code). **Never** use Tailwind's generic font utilities (`font-mono`, `font-sans`, `font-serif`); they resolve to system stacks that are not our design. If a font isn't in the app's `@theme`/`@font-face` set, it doesn't ship.

### 3. Type sizes: Tailwind scale only

Use Tailwind's type scale (`text-xs`, `text-sm`, `text-base`, `text-lg`, …). **Never** use arbitrary size values (`text-[10px]`, `text-[8px]`). Off-scale sizes are not reviewable against a consistent rhythm and tend to multiply. The same applies to other tokens where a scale exists (spacing, radius) — prefer the scale over `[...]` arbitrary values unless there is a documented reason.

### 4. Extract meaningful JSX into named components

When a branch of a component's markup expresses a distinct idea (an empty state, a labelled row), extract it into a named presentational component (e.g. `EmptyMessageLine`) rather than leaving an anonymous block inline. Names convey intent; small components stay Storybook-renderable.

---

## Consequences

- **Positive:** One card implementation; consistent typography and fonts; smaller, named, testable UI units.
- **Cost:** Domain cards now delegate rendering to a UI card and pass pre-formatted strings (cost/refund), adding one indirection — accepted for the single-source-of-truth gain.
- **Enforcement:** Reviewed by hand for now. Candidates for future automation: an ESLint rule banning `font-mono`/`font-sans` and `text-[…px]` arbitrary values in `src/ui/`.

---

## Follow-ups

- `ExposedConfigDeckDisplay` still hand-rolls a mini-card; migrate it to the shared `ConfigCard.ui` (grid layout + `title` behaviour) in a later pass.
