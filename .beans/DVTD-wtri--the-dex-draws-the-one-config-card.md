---
# DVTD-wtri
title: The Dex draws the one config card
status: completed
type: task
priority: normal
created_at: 2026-09-26T15:14:31Z
updated_at: 2026-09-26T15:31:07Z
parent: DVTD-sg5i
---

**What:** The Dex Configs tab draws the same foldable config card every other screen draws, and heads each weight group with a labelled bar that leads with the weight block.

**Why:** The Dex is the last surface still on the info press and its floating panel, which is unreachable by touch, and its group heading states its figures as flat text where every comparable line states them as marks.

## Done when

- [x] A config on the Dex reads as the same card the shop and the build draw
- [x] No info press and nothing floating over a Dex card
- [x] A locked config states how to unlock it inside the card, with its progress
- [x] Each weight group is headed by its weight block, the weight named, and how much of it you hold
- [x] The tab opens collapsed and can be expanded in one press

## Notes

Finishes the parent's open item: the Dex card had not been moved onto the shared parts.

Plan: ~/.claude-work/plans/for-the-dex-page-hazy-pebble.md

## Summary of Changes

DexConfigChip is deleted and the Dex renders the shared ConfigChip. The `i` and
its floating panel went with the file; the disclosure is the card's chevron,
opening in place, and the tab shares the shop's flips-from-default store with an
expand all / collapse all press in the panel header.

ConfigChipProps split into a redactable half and a stated one, and
`Redactable<Secret, Stated>` now takes both. The weight and the unlock paths are
stated even while locked; the name, the effect and the badges stay secret. A
locked chip given neither stays the blackout it was, so nothing on the shop
changed. A locked card wears the dashed edge; the blackout keeps the solid one.
The card's footer is drawn only when it has a version, a price or a badge.

ConfigUnlock.ui.tsx is new beside ConfigFacts.ui.tsx: the paths, their progress
bars and their labels, no longer Dex-private. The three Dex states are now which
props are present rather than a discriminator, so `met` lost its dimming (no
producer until DVTD-s5vo).

The weight-group heading is a labelled bar: weight block, `weight 8`, `1 of 5`,
then a rule. The viewmodel returns `label` and `held` instead of one string.

ADR-120 written; ADR-108 D1, D2, D3 and D5 collapsed to pointers with their
numbers kept, D4 intact. CHANGELOG updated.

Verification: 4010 tests across 207 files, typecheck, oxlint, dependency-cruiser,
prettier, wiki sync and the production build all green. Every ConfigChip and
DexConfigs story renders.
