---
# DVTD-tncz
title: The poll screen always draws the submit button
status: completed
type: bug
priority: high
created_at: 2026-09-16T12:08:03Z
updated_at: 2026-09-16T12:18:02Z
---

Playtest feedback (2026-09-16). A single-answer poll commits on the press: picking a keycap sends the answer with no confirmation and no way back. DVTD-ltci made that the fix for "a single-answer poll had no way to submit"; the wrong half was chosen. The press should select, and the footer should send, for every answer type.

`liveFooterFor` in PollView.component.tsx returns undefined unless the poll is select-all, so the ScreenFooter is never drawn for a single. `RunPoll.onSelect` and the proto-run route both short-circuit `answerType === "single"` straight into submit.

- [x] `liveFooterFor` is gone; `submitFooterFor` is called for every live poll
- [x] `RunPoll.onSelect` selects one option for a single, never submits
- [x] proto-run route does the same
- [x] Specs updated: a single-answer press selects and does not answer; the footer sends it

## Summary of Changes

A single-answer press is now a radio pick: it replaces the held option rather than adding to it, which is what a press has to mean once the press no longer commits. The footer is the one way to send an answer for every answer type, so the refusal line ("pick an answer first") is also the same everywhere.

DVTD-ltci had solved the same complaint the other way round. The submit button was the half worth keeping: a poll is scored and cannot be taken back, so a press that commits with no confirmation is a trap on a keycap grid where a misclick is cheap.
