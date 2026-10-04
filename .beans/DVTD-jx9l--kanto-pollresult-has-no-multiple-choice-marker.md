---
# DVTD-jx9l
title: Kanto PollResult has no multiple-choice marker
status: todo
type: bug
priority: normal
created_at: 2026-09-23T11:45:24Z
updated_at: 2026-09-23T11:45:24Z
---

The terminal community screen carried a `multiple` flag on a poll's detail, so the board said when a question was select-all. Kanto's `PollResult` has no equivalent, and the adapter dropped it in DVTD-6crx rather than hand-rolling Tailwind to put it back.

A select-all poll now reads exactly like a single-answer one on /run/community, which misreads the option shares: on a multi-answer poll they may sum past 100, and nothing on the row explains why.

`RunCommunityPollDetail.answerType` still carries it — the data is there, only the render is missing.

- [ ] Add the marker to `PollResult` (kanto)
- [ ] Pass `answerType` through `pollResultsFor` in CommunityView.component.tsx
- [ ] Cover it in CommunityView.spec.tsx
