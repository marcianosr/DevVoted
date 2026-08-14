---
# DVTD-jcdg
title: 'Skip shop button: ''Skip shop and go to community'' when open, ''Go to community'' when closed'
status: completed
type: feature
priority: normal
created_at: 2026-07-07T08:40:42Z
updated_at: 2026-07-07T08:41:40Z
---

When the shop is open, the 'Skip shop' button becomes 'Skip shop and go to community' — clicking it adds +64KB and navigates to /community. When the shop is closed, the button just says 'Go to community' and only navigates.

## Summary of Changes\n\n- Modified \n- Added  import and hook\n-  now navigates to  after invalidating\n- When : button shows 'Skip shop and go to community', with storage gain label below\n- When : button shows 'Go to community' (pure navigation, no skip logic)
