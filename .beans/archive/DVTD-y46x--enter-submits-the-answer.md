---
# DVTD-y46x
title: Enter submits the answer
status: completed
type: feature
priority: normal
created_at: 2026-09-06T10:48:00Z
updated_at: 2026-09-06T11:44:56Z
---

Letters already pick an answer. Enter should submit it, so a fast player never leaves the keyboard.

- [x] Enter submits on the terminal-theme poll screen when a pick is made and submit is enabled
- [x] Ignore Enter while typing in an input, and while the submit is locked
- [x] Tip line mentions Enter
- [x] Stories + specs
- [x] lint, typecheck, tests

## Summary of Changes

Enter now submits, so a poll can be finished without leaving the keyboard.

- `ChoiceList.ui.tsx` takes an optional `onSubmit`. The existing window keydown listener handles `Enter` before the single-character guard, skipping it when the event target is a BUTTON / A / SUMMARY / SELECT, which already activate on Enter and would otherwise fire the submit twice.
- The tip line swaps to "Tip: press a letter to answer, Enter to submit" only when Enter actually submits, so it can never promise a key that does nothing.
- `PollScreen.ui.tsx` passes `onSubmit` only while `submitLock` is undefined, which means Enter is inert until a pick is in (the lock reads "Pick an answer").

Verified: 4 new ChoiceList specs and 2 new PollView specs, 149 tests pass across every file touched today.
