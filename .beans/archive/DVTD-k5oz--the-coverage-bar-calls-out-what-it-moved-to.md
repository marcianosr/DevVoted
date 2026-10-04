---
# DVTD-k5oz
title: The coverage bar calls out what it moved to
status: completed
type: feature
priority: normal
created_at: 2026-09-12T17:09:41Z
updated_at: 2026-09-12T17:18:29Z
---

When a poll is answered the gate meter changes, but the kanto CoverageBar only states its settled position. A silent jump reads as a glitch, especially on a miss where coverage bleeds backwards.

The fill moves softly, and while it moves a small callout rides its leading edge counting from the old percentage to the new one, then fades.

## Decisions

- Reads: one live number climbing/falling in lockstep with the fill (42 -> 47)
- Lifetime: fades in with the move, holds ~1.8s, fades out
- State: CoverageBar detects the change itself; no caller wires anything
- Chrome: a Badge wearing the new band's colour (ADR-066), no new chrome
- Name: "callout", the word terminal-theme already uses, not "tooltip"

## Todo

- [x] app.css: bump --coverage-bar-duration to 700ms
- [x] app.css: .coverage-bar-pin fade + left tracking
- [x] app.css: .coverage-bar-count reusing @property --coverage-count
- [x] app.css: extend the reduced-motion guard, keeping it one rule block
- [x] CoverageBar.ui.tsx: detect the move, one pin in two moods
- [x] CoverageBar.spec.tsx: 17 new tests across two describes
- [x] CoverageBar.stories.tsx: the AnswerLands interactive story
- [x] ADR-077 + README row (076 was taken mid-session)
- [x] lint, build, full test suite

## Summary of Changes

Mid-session the file gained a `pin` feature in parallel: a band-coloured label
with a stem at the fill's leading edge, marking where a closed gate landed.
Rather than build a second label beside it, the pin became one element in two
moods.

- `app.css`: `--coverage-bar-duration` 400ms to 700ms (400ms is too short to
  read a changing number). New `.coverage-bar-pin` opacity/left transitions
  keyed on `data-shown`, and `.coverage-bar-count` reusing the ring's registered
  `@property --coverage-count` but off the bar's own duration. Both joined the
  existing reduced-motion guard as extra selectors in the one rule block, since
  both coverage specs match guards with a regex that accepts only one nested
  rule.
- `CoverageBar.ui.tsx`: the pin row always renders. Pinned means permanent and
  states its tenth. Unpinned means hidden until `held` changes, then counts in
  whole percent, holds `COVERAGE_PIN_HOLD_MS` (1800), fades. The move is caught
  during render by comparing the last reading; a timer only spends the hold. No
  prop changes, so every embedding screen gained it unedited. Added an sr-only
  `role="status"` since the track's `role="img"` label does not announce on
  change.
- `CoverageBar.spec.tsx`: 17 new tests. One existing test changed mechanism (the
  pin is now present-but-hidden rather than absent); the guarantee is the same.
- `CoverageBar.stories.tsx`: `AnswerLands`, with Correct/Miss buttons.
- `docs/adr/077-the-pin-rides-the-fill-it-names.md` plus its README row.

## Why a transition and not a keyframe

Replaying a keyframe needs the element remounted, and a remount resets
`--coverage-count` to its registered `initial-value` of 0, so the pin would
count from zero on every answer instead of from the figure it left. Keeping the
element mounted and fading it lets CSS supply the previous value itself, which
is why the pin needs no `from` prop.

## Verification

- `npm run lint`: clean, no dependency violations (1004 modules). One
  pre-existing warning in `Screen.stories.tsx`, untouched.
- `npm run build`: passed.
- `npm test`: 250 files, 4622 passed, 6 skipped, 2 todo.
- prettier applied to the three TS files, never to `app.css`.

## Deferred

The kanto poll screen still has no route, so this is not player-reachable and no
CHANGELOG entry was added. It lands when the screen is wired.
