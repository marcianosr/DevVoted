---
# DVTD-1rqu
title: Typography loses its dead faces and stray sizes
status: completed
type: task
priority: normal
created_at: 2026-10-07T07:15:28Z
updated_at: 2026-10-07T07:18:19Z
---

**What:** Remove the unused typefaces and weights, fold the hand-written small sizes into the scale, and drop weights the page already inherits.

**Why:** A typography audit found four faces loaded for one in use, fifteen sizes where two do the work, and five weights where bold is the default.

## Done when
- [x] Only the faces and weights the app renders are declared
- [x] No hand-written pixel or rem text size duplicates a scale step
- [x] The admin panel uses the same weights as the rest of the app

## Notes
Plan: ~/.claude-work/plans/can-you-find-out-drifting-axolotl.md. Space Mono lost to JetBrains Mono (decided 2026-10-07); tracking was settled earlier in DVTD-48k4. Routing raw text-xs/text-sm through Typography is the follow-up, not this bean.

Dropped from scope: stripping font-bold that restates the body weight. Several Typography variants set font-normal, and a font-bold beneath one is what keeps the text bold, so which ones are redundant is only visible when rendered.

Left as-is: text-[8px] on the Climber badge and text-[0.6875rem] on the PollTiles name sit between scale steps; folding them is a design call.

## Summary of Changes

- Removed Space Mono (package, imports, data-font rules) and the Storybook Font and Tracking toolbars; JetBrains Mono won and tracking was settled in DVTD-48k4.
- Removed Pixter Granular (font files, font-face rules, token); nothing used it.
- Dropped the JetBrains Mono 500 face; the admin panel was its only user and now uses bold.
- Replaced eight text-[10px] and text-[0.625rem] with text-xxs. Line height shifts from 15px to 14px where no leading is set.
- Not player-visible beyond that 1px, so no changelog entry.
