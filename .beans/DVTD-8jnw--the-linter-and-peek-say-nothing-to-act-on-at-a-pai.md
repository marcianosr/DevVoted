---
# DVTD-8jnw
title: The linter and peek say nothing to act on at a pairs poll
status: completed
type: bug
priority: normal
created_at: 2026-10-11T08:39:24Z
updated_at: 2026-10-11T08:40:32Z
---

**What:** On a matching-pairs poll the linter and peek refuse with nothing to act on and can't be spent.

**Why:** The linter said one wrong left on a poll with no wrong answers at all, and a peek could be bought there for nothing.

## Done when
- [x] The linter on a pairs poll reads nothing to act on, not one wrong left
- [x] Pressing the linter or peek on a pairs poll charges nothing
- [x] A pick poll down to its last wrong answer still reads one wrong left
- [x] The pairs ADR, the wiki and the changelog say what both presses do

## Notes
ADR-192 Decision 6 already called both inert; the code fell through to lastWrongStanding because every pairs tile is stored correct, and peekApplies never checked the answer type. Fix: isPairsPoll in paidAction.model with a pairsPoll refusal.

## Summary of Changes

paidAction.model gained isPairsPoll and a pairsPoll refusal: lintApplies and peekApplies return false on a pairs poll, and both refusal functions name it before frozen, rate limited and one wrong left. The poll screen states it as nothing to act on. Specs cover the refusal, the free press and the pick-poll regression. ADR-192 Decision 6, the wiki line and the pairs changelog entry say what both presses do.
