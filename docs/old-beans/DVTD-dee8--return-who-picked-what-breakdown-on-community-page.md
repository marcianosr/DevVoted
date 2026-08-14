---
# DVTD-dee8
title: Return who-picked-what breakdown on community page
status: completed
type: feature
priority: normal
created_at: 2026-07-03T13:09:32Z
updated_at: 2026-07-03T13:13:03Z
---

Reinstate the per-option 'who picked what' breakdown on /community, reusing the PollAnswerReview visual (correct/wrong/muted option rows) with small voter avatars per option; hovering an avatar shows the AvatarPopover detail panel. Data already exists (communityStats.optionBreakdown[].voters). Extend PollAnswerReview with an optional voters slot; add PollAnswerBreakdown domain component; render in CommunitySection, gated on the viewer having answered (avoid spoiling correct answers).

## Summary of Changes

Data already existed (communityStats.optionBreakdown[].voters) — this was pure UI composition.

- Extended PollAnswerReview.ui (Tier-1) with an optional per-option `voters?: ReactNode` slot, right-aligned. Moved the muted opacity from the whole <li> onto the option content wrapper so voter avatars stay crisp; the review screen is visually unchanged (no voters there). Added a WithVoters story.
- New PollAnswerBreakdown.component (domain): maps optionBreakdown -> AnswerReviewOption[], rendering each voter as <AvatarPopover><Avatar size=sm/></AvatarPopover> (hover = detail panel). isYours = viewer is among the voters.
- CommunitySection renders a "Who picked what" subsection, gated on viewerHasAnswered (viewer appears in some option's voters) so it never spoils the correct answer for someone who hasn't answered.

tsc/lint/build clean, 532 tests pass.
