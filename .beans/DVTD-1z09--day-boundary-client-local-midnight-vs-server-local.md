---
# DVTD-1z09
title: 'Day boundary: client-local midnight vs server-local seed date'
status: todo
type: task
priority: low
created_at: 2026-08-05T08:10:40Z
updated_at: 2026-08-05T08:10:40Z
---

getTodayDateString() keys the daily seed on the SERVER process date, while the countdown (useNextPollsCountdown, and the legacy useCountdownToNextPoll) counts to CLIENT-local midnight. Same machine in dev; in production a UTC server vs NL players drifts 1-2h — the timer hits zero at local midnight while the server still serves yesterdays seed (Climb on bounces back to the board until the server date flips). Decide the canonical day boundary (fixed TZ like Europe/Amsterdam server-side, or a server-provided nextSegmentAt timestamp) and align both countdowns. Related pre-existing wart: the legacy hook recomputes next-midnight per tick so its isOpen practically never flips (the new hook pins the deadline at mount instead).
