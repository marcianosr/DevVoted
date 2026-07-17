---
# DVTD-rsb2
title: 'Answer speed: capture elapsed time per answer, show in AnswerResults'
status: todo
type: feature
created_at: 2026-07-17T10:30:45Z
updated_at: 2026-07-17T10:30:45Z
---

Marciano wants 'how fast someone answered' in the answer review. Pure reducer can't call Date.now — elapsed must ride the answer action payload: route wiring stamps when the poll is shown (useRef on currentIndex change) and dispatches answer with elapsedMs; AnsweredPoll gains elapsedMs; AnswerResults renders it in the right-hand meta slot (e.g. '4.2s').

Design decision for Marciano: when does the clock start — poll rendered, or first interaction? And does it pause on tab blur? Also relevant to the parked Speed check-config (ADR-006 Decision 4), which needs the same timing data — build the capture once for both.

- [ ] Decide clock-start semantics
- [ ] answer action gains elapsedMs (wiring-supplied)
- [ ] AnsweredPoll.elapsedMs + reducer spec
- [ ] AnswerResults meta slot renders speed
- [ ] Consider feeding the Speed check-config (DVTD roster)
