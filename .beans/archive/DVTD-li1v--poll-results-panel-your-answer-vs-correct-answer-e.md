---
# DVTD-li1v
title: 'Poll results panel: your answer vs correct answer, explanation, pagination'
status: completed
type: feature
priority: normal
created_at: 2026-07-18T08:53:01Z
updated_at: 2026-07-18T13:07:49Z
parent: DVTD-u35m
---

Upgrade the expanded answer panel to the poll-results design (Marciano's mockup): per-poll detail with YOUR ANSWER / CORRECT ANSWER boxes, WHY THIS IS CORRECT (only when the poll has an explanation), outcome counts in the header, and prev/next pagination. No sidebar.

## Todo

- [x] RunPoll carries `explanation` from polls table (server-only path)
- [x] AnsweredPoll captures `correct` labels + `explanation` at answer time
- [x] AnswerResults panel: your answer / correct answer / explanation sections
- [x] Correct-answer box only when outcome isn't correct; explanation only when present
- [x] Counts summary line (n correct · n partial · n incorrect)
- [x] Prev/next pagination with first poll expanded by default
- [x] Specs

## Summary of Changes

- `RunPoll.explanation` flows from `polls.explanation` via `ENGINE_POLL_COLUMNS` (server-only engine path).
- `AnsweredPoll` gains optional `correct` labels + `explanation`, captured at answer time in the reducer; optional keeps old persisted snapshots valid (UI falls back to outcome-level coloring).
- AnswerResults: outcome counts line, first poll auto-expanded, per-pick right/wrong boxes (partial answers judged pick-by-pick), CORRECT ANSWER only on a miss, WHY THIS IS CORRECT only when an explanation exists, prev/next + outcome-colored dots. No sidebar (per Marciano).
- Also this session: summit screen gained a Start-a-new-run action (server's one-run-per-day rule answers same-day clicks; works when the next seed drops).

## Iteration: option-list review (same session)

Marciano's follow-up mockup replaced the YOUR ANSWER / CORRECT ANSWER boxes with a full option replay. `AnsweredPoll` additionally captures `options` (all labels) + `answerType`; new shared `presentation/poll/PollOptionReview.ui.tsx` renders every option with a radio/checkbox control by answer type — correct set revealed in viridian, wrong picks in cinnabar, unpicked neutral. Explanation moved into a bordered "💡 Explanation" box. Answer-type hint reused from PollCard (`ANSWER_TYPE_HINT` export).
