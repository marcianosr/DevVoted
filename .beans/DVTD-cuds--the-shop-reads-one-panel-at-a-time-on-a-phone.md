---
# DVTD-cuds
title: The shop reads one panel at a time on a phone
status: completed
type: feature
priority: normal
created_at: 2026-09-29T18:11:31Z
updated_at: 2026-09-29T18:23:06Z
---

**What:** The shop splits build, desk and services left of the registry on desktop, and shows one panel at a time behind a tab strip on a phone.

**Why:** On a phone the registry, the shop's actual decision, sat below the whole build; on desktop the right column carried everything.

## Done when
- [x] Desktop: build, incident desk and services left, the registry alone right
- [x] Phone: a tab strip opens on the registry and shows one panel at a time
- [x] A collapsed config card states a one-line peek of what it does
- [x] On a phone the footer states run storage beside the press
- [x] Services states how many are ready and folds the locked ones behind one row

## Notes
Plan: ~/.claude-work/plans/reorganize-the-shop-like-parallel-beaver.md

## Summary of Changes

ShopScreen splits its columns (build, desk, services left; registry right) and on a phone shows one panel behind a pill tab strip (Tabs gained a pill look and counts). ConfigChip peeks its description when collapsed. ScreenFooter takes phoneFunds and Header can keep its balance off a phone. Services head counts ready rows and folds locked ones. ADR-155, wiki §8 and CHANGELOG updated.
