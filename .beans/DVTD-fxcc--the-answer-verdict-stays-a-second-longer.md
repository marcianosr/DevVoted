---
# DVTD-fxcc
title: The answer verdict stays a second longer
status: completed
type: task
created_at: 2026-10-08T11:41:02Z
updated_at: 2026-10-08T11:41:02Z
---

**What:** The poll screen holds the right/wrong reading one second longer before moving to the next poll.

**Why:** Playing it, the verdict left before it had been read.

## Done when

- [x] Right answers hold 1.65s, wrong ones 1.9s; the flying chip rule is unchanged
- [x] The wiki, ADR and changelog quote the new figures

## Summary of Changes

`ANSWER_HOLD_MS` in `useAnswerFeedback.hook.ts` → `{ right: 1650, wrong: 1900 }`; ADR-170 D1 + amendment 2026-10-08; wiki "How an answer lands"; CHANGELOG Unreleased.
