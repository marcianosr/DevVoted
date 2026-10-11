---
# DVTD-dcfz
title: 'Matching pairs: four pairs in two columns'
status: in-progress
type: feature
priority: normal
created_at: 2026-10-05T18:49:41Z
updated_at: 2026-10-11T07:55:42Z
---

**What:** A third poll type: four pairs in two columns, and the player taps a tile on each side to match them.

**Why:** It asks for several facts in one quick poll, where a single-answer question lets one fact give the whole answer away.

## Done when
- [x] An author can write a pairs poll: a question and four pairs of two tiles
- [x] A player matches a pair with two taps; a match turns green, a miss turns the started pair red
- [x] Each matched pair pays a third; the last pair locks itself and pays nothing
- [x] Audits and configs that read the answer key treat a pairs poll deliberately
- [ ] A pairs poll is played end to end on a local run

## Notes
Replaces the dependency grid (12 tiles, 3 hidden groups of 4) this bean first shipped on its branch; the grid felt too slow, and a typed "puzzle" variant was dropped because answers can be misspelled. ADR-192 is rewritten in place (the grid never merged). Share = matched / 3 at x2 credit. Within a pair the lower option id is the left tile, so option reads are ordered by id. The migration is new (20261011120000_matching_pairs) so it sorts after the migrations already on main.

## Summary of Changes

Pairs is a third answer type: tiles carry a pair index (guarded migration, no group names). The run's match-pair action takes two tiles from opposite sides; a match records the tiles, a miss records the anchor's pair, and the poll finishes through the normal answer scoring once three pairs are resolved. The client gets two seeded-shuffled columns with a state per tile and never an unresolved pair. The second tile answers, a same-side tap swaps the pick. Authoring has a pairs mode with four left/right rows; seeds and proto-run deal pairs polls.
