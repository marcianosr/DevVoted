---
# DVTD-lmxg
title: A poll is written in one field, code and all
status: completed
type: feature
priority: normal
created_at: 2026-09-28T13:31:03Z
updated_at: 2026-09-28T13:47:28Z
---

**What:** The suggest-a-poll form is rebuilt on the kit: write or preview the question, keycapped answers with one right or several right, a press that names what is still missing, and code typed in the question (backticks, fenced blocks) renders as code in the preview and in the run.

**Why:** It is the last authoring screen in the legacy look, the run shows seeded questions' backticks literally, and an explanation written while suggesting a poll has been silently dropped since 1.3.0.

## Done when

- [x] The form is built from the kit with three panels, a write or preview switch, keycapped answer rows and a commit bar whose refusal names the first unmet rule
- [x] Backticks and fenced blocks in a question render as code on the run's poll screen and in the form's preview; the separate code block field is gone from the form
- [x] An explanation written on the create form is saved
- [x] Limits (question 10 to 2000, answers 3 to 20) have one owner read by the schema and the form
- [x] Story, specs, lint and typecheck are green; changelog has Changed and Fixed entries; the decision is an ADR

## Notes

Mock supplied by Marciano on 2026-09-28. Decision: the question text is the one source of code; the code block column stays as a legacy read-only column. Fence-splitting over a markdown pass so nothing but backticks is interpreted. Submit is the kit commit bar (the mock is cut off there). New kit primitives: Keycap (extracted from Choice), TextField, TextArea, Button slot tone; Select gains a visible caption.

## Summary of Changes

The suggest-a-poll form is rebuilt on the kit: a cerulean Screen with the mark, headline and one-line promise; a Question panel with a write or preview switch (the preview is the run's own Question), a TextArea and a footer stating the count; an Answers panel with one right or several right, one ringed row per answer (Keycap, TextField, mark right, remove), a dashed add press and a count; a Details panel (category, CodeSandbox, explanation, status for an admin edit); a cinnabar error line; and the kit commit bar whose refusal names the first unmet rule.

- pollForm.viewmodel.ts owns the state, pure updaters with stable answer keys, faceted refusals, counters and the preview; 24 specs
- The question renders code in the run: codeSpans.ts gained a fence splitter, CodeBlock takes a language, Question splits prose and blocks and renders inline spans as code, only its first prose part is the h1
- New kit: Keycap (extracted from Choice), Field caption helper, TextField, TextArea, Button slot tone; Select gained a visible caption and note; all with stories and specs
- POLL_LIMITS and isPollStatus in poll.model.ts, read by the schema and the form; the sandbox URL rule is one exported schema
- Server: createPoll validates with the shared schema and the service maps explanation (shipped defect since 1.3.0, Fixed entry); update leaves the legacy code block untouched because the form never sends it
- The polls list counts a fenced question as with code and shows only its prose; letterAt has a shared home in letters.ts
- PollFormPage.ui.tsx deleted; PollEdit loading, denied and error screens restyled onto Screen
- ADR-137, wiki 2.4 line, changelog Changed and Fixed

Verified: 4675 tests pass; the 14 failures are all in CommunityView.spec.tsx, which another session left mid-edit. Lint, dependency-cruiser and the wiki check are clean.

Caveats: answer options do not render code yet; the two run copies of letterAt still stand (follow-up bean).
