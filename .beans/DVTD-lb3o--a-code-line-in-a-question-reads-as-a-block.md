---
# DVTD-lb3o
title: A code line in a question reads as a block
status: completed
type: feature
priority: normal
created_at: 2026-10-09T10:33:14Z
updated_at: 2026-10-09T10:35:58Z
---

**What:** A question line that holds only inline code renders as the dark highlighted code block, and the code block drops its rounded panel border.

**Why:** Authors write a whole line of code in single backticks; it read as a bold inline chip instead of code.

## Done when
- [x] A question line that is only one backtick span renders as a highlighted code block
- [x] Answer options keep inline code as inline code
- [x] The code block sits on the dark highlight ground with no rounded panel border

## Notes
Promotion lives in codeSpans splitQuestionBlocks, used by the Question headline only. ADR-137 decision 1 updated.

## Summary of Changes

splitQuestionBlocks lifts a backtick-only line to a block for the Question headline; CodeBlock is a bare div on the github-dark hljs ground. ADR-137 and CHANGELOG updated.
