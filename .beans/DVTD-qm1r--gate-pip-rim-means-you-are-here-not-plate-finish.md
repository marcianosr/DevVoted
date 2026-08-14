---
# DVTD-qm1r
title: Gate pip rim means 'you are here', not 'plate finish'
status: completed
type: bug
priority: normal
created_at: 2026-08-07T08:53:21Z
updated_at: 2026-08-07T08:53:21Z
---

The Elite pip carried a pewter rim keyed to its `plate` finish, so it looked active from gate 0 onward. Marciano flagged it as confusing.

The rim now marks `standing === "current"` instead, which is the one thing a bar of pips has to communicate. The Elite pip fills with its indigo like every other themed pip; `SwatchMark` keeps its plate rim, where finish is the point and there is no active/inactive reading to confuse.

## Summary of Changes

- `GateSegmentBar.ui.tsx`: rim condition moved from `swatch.finish === "plate"` to `standing === "current"`.
- Spec: the Elite-rim test became two, one asserting the gate underway is rimmed and only it, one asserting Elite stays unrimmed until reached.
- Docs: wiki section 8 pip-bar paragraph and the "Every gate pip tells its own story" changelog entry.

Verified: 1171 tests pass, typecheck and lint clean, checked in the Storybook HUD story.
