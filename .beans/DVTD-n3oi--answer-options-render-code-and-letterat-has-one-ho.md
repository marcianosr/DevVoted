---
# DVTD-n3oi
title: Answer options render code, and letterAt has one home
status: todo
type: task
created_at: 2026-09-28T13:47:29Z
updated_at: 2026-09-28T13:47:29Z
---

**What:** Backticks in an answer option render as code on the poll screen, and the two run copies of the letter helper import the shared one.

**Why:** A poll's question renders code since ADR-137 but its options still show backticks literally, and the run keeps two private copies of letterAt beside the shared letters.ts.

## Done when

- [ ] An option such as `flex: 1` shows as code on the poll screen and in the form preview
- [ ] pollScreen.viewmodel.ts and gateReview.viewmodel.ts import letterAt from letters.ts and their private copies are gone

## Notes

Deferred from DVTD-lmxg because pollScreen.viewmodel.ts had another session's in-flight edits on 2026-09-28. Choice takes a ReactNode label, so the option text can go through the same splitter Question uses.
