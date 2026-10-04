---
# DVTD-7900
title: The polls dex folds by category
status: completed
type: feature
priority: normal
created_at: 2026-09-29T12:39:05Z
updated_at: 2026-09-29T13:39:37Z
---

**What:** The polls tab of the dex groups its rows under a category heading that folds, and every heading states how much of that category you hold.

**Why:** Ninety-six rows in one flat list hides the shape of the collection; a player wants to know which language they have barely touched, not scroll for it.

## Done when

- [x] Every poll row sits under a heading naming its category, and the row no longer repeats that category
- [x] A heading states the categorys own progress, unseen polls included in its total
- [x] Every group starts folded, and a single press in the panel header opens or folds them all
- [x] The panel still counts the whole collection and names how many categories it spans

## Notes

An unseen poll keeps its question and score withheld; only its place in a category is stated, so the heading can name a target to complete.

## Summary of Changes

The polls panel takes groups instead of rows. A group names a category, states its own seen-against-total, and holds the rows of that category; the rows themselves dropped the category badge the heading now carries. A heading with no fold handler states its rows, matching how a chip that cannot fold always states its description.

The grouping is derived in the dex viewmodel from the domains own filter and coverage helpers, so no new domain code was needed. The screen holds a second disclosure set beside the one the config cards use, defaulting to folded, and the panel header reuses the expand-all press already shared with the configs tab.

An unseen poll now sits in the category it belongs to. Its question and score stay withheld; only its place is stated, which is what lets a heading name a target.

## Superseded

DVTD-rge1 (ADR-151, same day) replaced the category folding with an exclusive category
filter, one day after this landed. What survives: an unseen poll still states its real
category, and a category still counts its own seen against its own total. What went: the
foldable group headings and the expand-all press, because the list now sits beside a panel
and picking a row is what opens an entry.
