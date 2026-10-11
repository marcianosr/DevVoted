---
# DVTD-phu2
title: Wiki sections lead with an icon and bold their key terms
status: completed
type: feature
priority: normal
created_at: 2026-10-08T17:48:30Z
updated_at: 2026-10-08T18:57:25Z
---

**What:** Every wiki section heading sits beside a small icon tile, and the defining terms in its prose read bold.

**Why:** The wiki reads as one grey wall; an icon and a bold term let a player scan for the section and the word they came for.

## Done when
- [x] A plain wiki section shows an icon tile beside its heading
- [x] Prose can bold a term, and figures inside it still badge
- [x] How to play bolds the terms the mock bolds
- [x] Lint, typecheck and tests pass

## Notes
Mock: ~/Downloads/devvoted-wiki-v2.html. Scope is the three screenshots only; the rest of the mock (search, numbered nav, hero, flow diagram, outcome cards, pager) is out.

## Summary of Changes

- Prose parses **term** into a bold span at the full text rung; figures inside still badge.
- WikiSection carries an optional icon; section() requires one, spoiler() does not (Fold has no icon slot).
- WikiScreen heads a plain section with an icon tile beside a title-variant heading.
- How to play bolds build, 13 gates, same 5 polls, 5 configs, 4 weight, prep, archived storage.
- Lint clean, build passes, 336 files / 6162 tests pass.
