---
# DVTD-m3n6
title: Phones get a bottom tab bar and a sticky start press
status: completed
type: feature
priority: normal
created_at: 2026-10-04T17:10:15Z
updated_at: 2026-10-04T17:20:08Z
---

**What:** On a phone the nav items move to a tab bar fixed at the bottom, and the new run and prep start presses stick just above it.

**Why:** On a phone Daily Run and Community hid in the avatar menu, an empty pill sat in the bar, and the press that moves you on scrolled out of reach.

## Done when
- [x] A phone shows Daily Run, Community and Profile in a bar at the bottom
- [x] The empty pill beside the logo is gone
- [x] The new run and prep start presses stay in view at the bottom of a phone screen
- [x] A wide screen is unchanged

## Summary of Changes

AppNav: header destinations hidden below md, new TabBar (fixed, md:hidden) with run/community/profile; Nav passes profileActive. Root main sets --tab-bar and pads by it. ScreenActions sticks at bottom var(--tab-bar); NewRunScreen press cell is the sticky item; PrepScreen uses ScreenActions with its press column display:contents on phones. ADR-188.
