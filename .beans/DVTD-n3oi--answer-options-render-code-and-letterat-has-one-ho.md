---
# DVTD-n3oi
title: Answer options render code, and letterAt has one home
status: todo
type: task
created_at: 2026-09-28T13:47:29Z
updated_at: 2026-10-05T12:10:00Z
---

**What:** Backticks in an answer option render as code on the poll screen, and the run's two private copies of the option-letter helper give way to the shared one.

**Why:** A poll's question renders code since ADR-137 but its options still show backticks literally, and the run keeps two private copies of the option-letter helper beside the shared one.

## Done when

- [x] An option written with backticks shows as code on the poll screen and in the form preview
- [ ] The poll screen and the gate review letter their options with the shared helper, and their private copies are gone

## Notes

Deferred from DVTD-lmxg because pollScreen.viewmodel.ts had another session's in-flight edits on 2026-09-28. Choice takes a ReactNode label, so the option text can go through the same splitter Question uses.

The second checkbox means: pollScreen.viewmodel.ts and gateReview.viewmodel.ts import letterAt from letters.ts and their private copies are gone.

2026-10-05: options render code. `CodeText` in Question.ui.tsx runs an option through splitCodeBlocks + CodeSpans; Question and PollResult (community board) use it, so the poll screen, review, poll page, form preview and community results all agree. ADR-137 decision 5. An option is authored in a one-line TextField, so a pasted fence loses its line breaks before it is saved; the form needs a multi-line answer field for a fenced option to keep its lines. letterAt is still open.
