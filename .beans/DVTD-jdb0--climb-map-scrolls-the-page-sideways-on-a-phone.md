---
# DVTD-jdb0
title: Climb map scrolls the page sideways on a phone
status: todo
type: bug
created_at: 2026-10-08T09:43:43Z
updated_at: 2026-10-08T09:43:43Z
---

**What:** The community board's climb map stays within the screen width on a phone.

**Why:** Its gate track runs past the right edge, so the whole page scrolls sideways.

## Done when
- [ ] On a phone the page has no sideways scroll
- [ ] The climb map still shows every gate

## Notes
Measured 2026-10-08 in Storybook (CommunityScreen, after-the-five) at iPhone 13: document 706px wide in a 390px viewport. The overflowing elements are the gate track's dashed connector and gate tiles (Cinnabar 9, Viridian 10).
