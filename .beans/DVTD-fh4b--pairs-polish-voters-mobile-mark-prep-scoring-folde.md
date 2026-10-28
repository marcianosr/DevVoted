---
# DVTD-fh4b
title: 'Pairs polish: voters, mobile mark, prep scoring, folded score, badged notes'
status: completed
type: feature
priority: normal
created_at: 2026-10-12T09:44:07Z
updated_at: 2026-10-28T13:26:56Z
---

**What:** A pairs poll shows who matched each pair on the review and the community board, reads as a pairs board on the community list, and has its scoring stated on prep; the score breakdown starts folded and ledger notes badge their figures.

**Why:** Playtest showed pairs drawn as choice rows with an answer badge on every row, no faces on review, a cramped verdict mark on mobile, and prep explaining every poll type but pairs.

## Done when
- [x] The review and the community board show the faces of who matched each pair
- [x] The community list draws a pairs poll as a pairs board, not lettered choice rows
- [x] On a phone the tick or cross sits in the tile corner and the text keeps the width
- [x] Prep states what a pairs poll pays
- [x] The score breakdown is folded on the gate outcome and run over screens
- [x] Ledger notes badge their figures

## Notes
Branch feat/pairs-polish-v2 in worktree ../devvoted-tanstack-pairs-polish-v2. Ported 2026-10-28 from the uncommitted feat/pairs-polish worktree onto main after the ui-kit move (ADR-200); the community list part was dropped because the spotlight replaced that list.

## Summary of Changes
- Pairs tiles take optional voters; the review puts who matched each pair on its right tile, matched by the pair's right label carried from the community service.
- The community list draws a pairs poll as its answer key board instead of lettered rows.
- The verdict mark sits absolute in the tile corner below sm.
- Prep Scoring adds Matching pairs up to, stepped by thirds of four pairs.
- Score breakdown is a closed Fold on gate outcome (inside Coverage, Fold gained a surface switch) and run over.
- Ledger notes render through Figures.
- Out of scope: a gate's last poll stays hidden from the community board until the gate closes.
