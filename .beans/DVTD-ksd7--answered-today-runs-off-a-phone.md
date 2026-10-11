---
# DVTD-ksd7
title: Answered today runs off a phone
status: completed
type: bug
created_at: 2026-10-08T09:43:43Z
updated_at: 2026-10-08T09:43:43Z
---

**What:** The answered-today faces wrap onto a second line on a narrow screen.

**Why:** Ten faces ran off the right edge on a phone and let the page scroll sideways.

## Done when
- [x] On a phone the faces wrap inside the panel
- [x] On a wide screen the faces sit beside the label as before
- [x] Changelog updated

## Notes
The panel row's trailing slot never shrinks, so the crowded row puts its figures in a full-width line on a phone. Checked in Storybook at iPhone 13 and desktop widths.

## Summary of Changes

ClimberStack gained a wrap option; the crowded turnout row moves its count and faces out of the trailing slot into a line that is full width below sm.
