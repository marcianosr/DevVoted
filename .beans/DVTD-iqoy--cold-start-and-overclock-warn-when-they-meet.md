---
# DVTD-iqoy
title: Cold Start and Overclock warn when they meet
status: completed
type: feature
created_at: 2026-10-04T13:14:39Z
updated_at: 2026-10-04T13:14:39Z
---

**What:** A config with a first-answer effect is badged when the build already holds another one.

**Why:** Their first-answer multipliers multiply, so Cold Start with Overclock pays nothing on the opener and x0.75 after, worse than neither, and nothing said so.

## Done when
- [x] The offer warns before you install the second
- [x] Both build cards keep warning while they stand together

## Notes
openerClashFor in config.model; openerClashBadgesFor (saffron) in configChip.viewmodel; shop offers pass the installed build. The new-run hand does not warn yet.

## Summary of Changes
See Notes.
