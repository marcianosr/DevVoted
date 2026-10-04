---
# DVTD-6lr2
title: The poll screen offers no skip for now
status: completed
type: task
priority: normal
created_at: 2026-10-03T18:04:15Z
updated_at: 2026-10-03T18:06:58Z
---

**What:** The Skip press leaves the poll screen; the game rule behind it stays.

**Why:** Players cannot tell when a skip beats an answer, so the press reads as a trap until the screen can show what each choice does to the multiplier.

## Done when
- [x] The poll screen shows no Skip press, on the real run and on the proto rig
- [x] The wiki and ADR-169 say the press is withdrawn and why
- [x] Lint, typecheck and tests pass

## Notes
Domain skip action, reducer rule and validation schema are kept so restoring the press is a small revert. Follow-up idea: show right/wrong/skip multipliers beside the press (pollScreen viewmodel owns the copy, ADR-102).

## Summary of Changes
Skip press removed from PollScreen.ui, the poll viewmodel, RunPoll and the proto rig; specs updated; unreleased changelog bullet dropped; wiki and ADR-169 amended. Domain skip action, reducer rule and schema kept.
