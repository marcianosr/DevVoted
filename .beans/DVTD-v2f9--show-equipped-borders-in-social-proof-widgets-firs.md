---
# DVTD-v2f9
title: Show equipped borders in social-proof widgets (First to answer / Fastest responder)
status: todo
type: feature
priority: normal
created_at: 2026-06-04T08:05:58Z
updated_at: 2026-06-04T08:05:58Z
blocked_by:
    - DVTD-enj5
---

Borders are pointless if nobody sees them. The 'First to answer' / 'Fastest responder' widget is high-visibility — every player scrolls past it after answering a daily poll. Swap the plain UserAvatar there for AvatarWithBorder.

## Touchpoints
- Find the widget: likely in src/domains/polls/components/ (PostAnswerCarousel? PollResultsSection?)
- The currently-used avatar component (UserAvatar with colored initials) needs to be replaced with AvatarWithBorder
- Data flow: the query that fetches 'first to answer' / 'fastest responder' users needs to include equipped_border_id
- Probably: fetchPublicUser… queries in users/api/queries.ts gain an equippedBorderId field
- Cache invalidation: when a user equips a border, this widget should reflect after refresh (acceptable)

## Blocked by
DVTD-enj5

## Todo
- [ ] Locate the widget component (image shows 'First to answer' / 'Fastest responder' in daily poll flow)
- [ ] Extend public user query to include equipped_border_id
- [ ] Swap UserAvatar usage for AvatarWithBorder
- [ ] Verify avatar sizing — current AvatarWithBorder uses md/lg/xl, may need 'sm' for this widget
