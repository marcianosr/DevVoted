---
# DVTD-dcfz
title: A dependency grid hides three groups of four
status: completed
type: feature
priority: normal
created_at: 2026-10-05T18:49:41Z
updated_at: 2026-10-06T07:28:36Z
---

**What:** A third poll type: twelve tiles hide three groups of four, and the player locks in one group at a time.

**Why:** It rewards spotting a connection between ideas instead of recalling one fact, and it is the puzzle grid the wiki has planned.

## Done when
- [x] An author can write a grid poll: a question, three named groups, four tiles each
- [x] A player can pick four tiles, lock them in, shuffle, and see solved groups named
- [x] A wrong lock-in ends the poll like a wrong answer; solved groups still pay a third each; two solved lock the last in
- [x] The group names stay hidden unless the build names answer types
- [x] Audits and configs that read the answer key treat a grid deliberately

## Notes
Plan: share = solved / 3, credit x2. 207, 451 and Mirror exempt grids; grid tiles store correct=true so lint and peek are inert. The client never receives group membership; tiles ship shuffled by poll id. ADR-192 (190 and 191 were taken on other branches).

## Summary of Changes

Grid is a third answer type: tiles carry a group index, polls carry group labels (guarded migration). The run gains a lock-group action that stays on the grid on a solved group and finishes through the normal answer scoring on a wrong lock-in or once two groups are solved. Grading reads solved groups from the locked tiles, so the engine, community board and Dex agree. The client gets shuffled tiles without groups. Authoring has a grid mode with three named groups of four. Round-up applies to grids (rounds a third up to a whole unit), unlike the original plan. Verified in a headless browser on a local run: authored, solved one group, lost on a wrong lock-in (partial, a third), won a second grid via the auto-locked last group (full, three thirds).
