---
# DVTD-vlua
title: A poll author's card states what they wrote
status: completed
type: feature
priority: normal
created_at: 2026-09-29T13:36:58Z
updated_at: 2026-09-29T13:46:38Z
---

**What:** The hover card and the profile state the author's role, polls published and answers those polls received.

**Why:** A byline credits the author on a poll, but their card said nothing about what they wrote; crediting authors rewards writing polls.

## Done when
- [x] A player with a published poll shows role, polls published and answers on their hover card
- [x] The same line shows on their profile card
- [x] A player with no published poll shows no line
- [x] The poll byline and the card read one role label

## Notes
Answers count every polls_responses row on the author's published polls, all-time, any player, both modes.

## Summary of Changes
- authorship.model owns the role label (moved from runPolls.repository) and the contributor rule.
- fetchPublishedPollCounts counts published polls and every response on them; fetchPublicProfile selects the role.
- Player card and public profile services carry authorship; own profile reads it through a getAuthorship server function.
- Contribution.ui renders the line inside ProfileCard and ClimberCard.
- The climb map card has no authorship (built from ladder rows); follow-up if wanted.
