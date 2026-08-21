---
# DVTD-mfsy
title: 'Reskin: Foldable panel in src/ui/skin'
status: completed
type: feature
priority: normal
created_at: 2026-08-21T15:35:17Z
updated_at: 2026-08-21T15:50:47Z
---

First component of the UI reskin, Storybook-only. A bordered panel whose header line folds a divided list (native <details>/<summary>).

Decisions:
- Reskin lives in src/ui/skin/ because src/ui/theme/ already means gate colour theming (ADR-020).
- Self-contained raw Tailwind: the skin does not compose Title/Paragraph/TEXT_TONE, so it can diverge. Scoped exception to the design-system rule; wants an ADR if the skin survives.
- Outer fold only. The nested per-item key-value fold from the screenshot comes later.

- [x] src/ui/skin/Foldable.ui.tsx
- [x] src/ui/skin/Foldable.stories.tsx
- [x] src/ui/skin/Foldable.spec.tsx
- [x] lint, test, build green

## Summary of Changes

Three new files in src/ui/skin/, nothing else touched. No Storybook config change: main.ts already globs src/ui/**/*.stories.tsx.

- Foldable.ui.tsx: <details> panel, <summary> header (caret, title, right-aligned tally), <ul>/<ol> of <li> with divide-y divide-edge and a border-t under the header. Items are a keyed prop (id + content) rather than children, because the <li> and its divider are Tier-1 HTML. group/foldable is namespaced for the nested item fold to come. as="ol" swaps the tag only, no visible numbers.
- Foldable.stories.tsx: Skin/Foldable, w-[22rem] decorator. Default, Closed, Ordered, WithoutMeta.
- Foldable.spec.tsx: 6 tests (header text, row count, ul/ol tag, open by default, folded when defaultOpen is false).

Verified: npm run lint clean (562 modules cruised, no violations), 6/6 tests pass, tsc --noEmit exit 0.

Next: the item row component (status mark, name, detail, right-hand value) and its nested key-value fold.

## Follow-up: extract primitives + cva (2026-08-21)

Marciano's second pass. He hand-edited Foldable.ui.tsx first (p-2 spacing, no rounded corners, title at zinc-300, all doc comments deleted) — that version is the baseline.

- [x] Title.ui.tsx — cva, `as` variant drives size (h1 text-base / h2 text-sm / h3 text-xs), fixed text-zinc-300. Renders a real heading tag; Foldable passes as="h3" so the header stays 12px.
- [x] Subtitle.ui.tsx — cva, `tone` variant (muted pewter / default zinc-300), renders a span by default. Named Subtitle rather than Meta/Tally: the design system already owns that word for muted secondary text beside a title.
- [x] Chevron.ui.tsx — no cva, no variant axis; reads group-open/foldable off the parent details.
- [x] Foldable.ui.tsx composes all three; static panel/summary/list/item classes are module constants (no variant to select on). Prop meta renamed subtitle. The summary's text-xs is gone — the two typographic children now carry their own sizes.
- [x] Primitives.stories.tsx (Skin/Primitives) — all three levels, both tones, chevron shut and open, in one showcase (GateThemes.stories.tsx precedent).
- [x] Title.spec.tsx (3), Subtitle.spec.tsx (2)

Verified: lint clean (568 modules), 11/11 tests across 3 files, tsc exit 0.
