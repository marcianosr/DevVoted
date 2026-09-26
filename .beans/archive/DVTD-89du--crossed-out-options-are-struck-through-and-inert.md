---
# DVTD-89du
title: Crossed-out options are struck through and inert
status: completed
type: bug
created_at: 2026-09-03T20:07:18Z
updated_at: 2026-09-03T20:07:18Z
---

Live playtest: a linted option only dimmed with a 'crossed out' label.

- [x] Strike the label through literally
- [x] Stop the option taking a click

## Summary of Changes

New `crossedOut` state on the terminal-theme `Choice` (dimmed frame plus `line-through decoration-cinnabar`), wired from `PollView` for `disabledOptionIds`. `dimmed` stays as it was: the reveal screen uses it for options you did not pick, which must not be struck.

`PollScreen` withholds `onPick` for a crossed-out choice, so it renders Choice's inert div branch rather than a button. That was a real hole — `RunAnswer.onSelect` never checked `disabledOptionIds`, so a linted option was still selectable and submittable.
