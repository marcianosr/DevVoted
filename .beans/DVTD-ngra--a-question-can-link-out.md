---
# DVTD-ngra
title: A question can link out
status: completed
type: feature
priority: normal
created_at: 2026-10-08T13:53:31Z
updated_at: 2026-10-08T13:56:13Z
---

**What:** A poll's question, options and explanations can carry a link written as [text](url), which opens in a new tab.

**Why:** Authors credit the person or pen a trick came from, like Roel's tabular-nums codepen.

## Done when
- [x] A link written in a question renders as a link that opens in a new tab
- [x] Only http and https addresses become links; anything else stays plain text
- [x] A link inside backticks stays literal code
- [x] ADR-137 states links as the second interpreted pattern

## Notes
Separate splitLinks in src/shared/lib/codeSpans.ts applied to text spans inside CodeSpans; splitCodeSpans keeps its shape for PollMarkdown and pollList.

## Summary of Changes
splitLinks in codeSpans.ts (http/https only), applied to the text spans in CodeSpans via the kit Link (external). ADR-137 D2 amended, changelog Added entry. The admin polls table still shows the raw [text](url) in its question column.
