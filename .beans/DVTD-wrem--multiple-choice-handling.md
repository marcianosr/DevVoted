---
# DVTD-wrem
title: Multiple choice handling
status: completed
type: feature
priority: normal
tags:
    - gameplay
    - ui
created_at: 2026-07-19T09:10:52Z
updated_at: 2026-07-21T19:58:08Z
parent: DVTD-u35m
---

Implement mechanics for handling multiple choice questions in the quiz system, including answer validation, option presentation, and feedback logic.

## Audit + hardening (2026-07-19)

The multi-answer mechanics were already in place end-to-end (engine judging, PollCard multi-select, reveal beat, partial outcomes). What the audit found is a data problem, plus one real supply bug — fixed:

- **Fixed**: daily run seeds now exclude polls with zero correct options (`exists` guard in `getOrCreateDailyRunSeed`). Poll #318 (single, 0 correct) was in the pool and would have been an unavoidable "wrong" in someone's climb. Verified against local DB: 418 published -> 417 answerable.
- **Pinned in tests** (`run.model.spec.ts` "answer judging"): single with several correct options accepts any one pick; multiple with one correct demands the exact set (over-picking = partial); zero-correct polls are never correct (why the supply filter exists).

## Data decisions (Marciano's call — quiz content, not code)

- [ ] #318 single/0-correct — broken, needs a correct option (excluded from runs until then)
- [ ] #29 (5 of 16 correct) and #65 (2 of 7) marked `single` — mislabel? Engine accepts any one correct pick as-is
- [ ] #273 all 11 options correct, `single` — trick question or data error?
- [ ] 9 polls marked `multiple` with exactly 1 correct (#51 #79 #115 #135 #140 #230 #251 #270 #325) — legit trick ("select all that apply", one applies) or relabel to `single`?
