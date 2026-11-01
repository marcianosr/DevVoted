---
# DVTD-jdb0
title: Climb map scrolls the page sideways on a phone
status: completed
type: bug
priority: normal
created_at: 2026-10-08T09:43:43Z
updated_at: 2026-10-31T15:55:10Z
---

**What:** The community board's climb map stays within the screen width on a phone.

**Why:** Its gate track runs past the right edge, so the whole page scrolls sideways.

## Done when
- [x] On a phone the page has no sideways scroll
- [x] The climb map still shows every gate

## Notes
Measured 2026-10-08 in Storybook (CommunityScreen, after-the-five) at iPhone 13: document 706px wide in a 390px viewport. The overflowing elements are the gate track's dashed connector and gate tiles (Cinnabar 9, Viridian 10).

## Summary of Changes

2026-10-31: the track itself scrolled inside its box; the page widened because of one screen-reader label. The star's 'your best' text is sr-only, which is position absolute. The scroller was not positioned, so that span took its containing block from the relative wrapper above the scroller, escaped the overflow clip, and sat at the end of the track (x 1301 in a 375 viewport). Fix: the scroller is relative, so absolute children stay inside its clip. Measured in dev at 375px: page 1301px wide before, 375px after; the map still scrolls on its own. jsdom has no layout, so there is no spec for it.
