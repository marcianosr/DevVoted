---
# DVTD-d63c
title: Rename Dex Registry to Dex, reserving Registry for the shop
status: completed
type: task
priority: normal
created_at: 2026-09-24T16:35:31Z
updated_at: 2026-09-24T16:37:33Z
---

**What:** The collection screen is titled **Dex**, not **Dex Registry**.

**Why:** Registry is the in-run config market the shop deals from; one word should name one thing, and the navigation already says Dex.

## Done when

- [x] The screen heading and its tablist name read Dex
- [x] The wiki and CONTEXT.md say Dex, with Registry reserved for the shop's offer list
- [x] Tests, typecheck and lint pass

## Summary of Changes

- `DexScreen.ui.tsx`: `DEX_TITLE` is `Dex`; `DEX_TABLIST_LABEL` is `Dex collections`. The subtitle was already `everything the game has shown you`, so the header reads as intended with no layout change.
- Specs: the heading assertion in `DexScreen.spec.tsx`, and the generic `Tabs.spec.tsx` fixture that had borrowed the retired name.
- `docs/wiki.md` §6.4 and the glossary row now say Dex and state that Registry is the shop's in-run offer list. The glossary table is width-normalised by `docs:sync`, so a shortened cell fails `docs:check` until you re-run it.
- `CONTEXT.md`: a retired-vocabulary row for Dex Registry, so the two-word name does not come back.
- `CHANGELOG.md`: one Changed entry.

Verified: `npm test` 3715 passed (194 files), `npm run typecheck` clean, `npm run lint` clean.
