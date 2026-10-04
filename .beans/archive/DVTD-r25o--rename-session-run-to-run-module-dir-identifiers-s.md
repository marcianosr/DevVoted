---
# DVTD-r25o
title: Rename session-run to run (module dir, identifiers, story titles, docs)
status: completed
type: task
priority: normal
created_at: 2026-07-17T10:22:41Z
updated_at: 2026-07-17T10:25:45Z
---

Full rename per Marciano: src/modules/session-run -> src/modules/run; Session* identifiers -> Run*; 'Session Run/' story titles -> 'Run/'; ADR + memory path refs. DB mode value 'session' stays (schema discriminator, separate migration concern).

- [x] git mv directory + rename session* files
- [x] Rewrite import paths and identifiers
- [x] Story titles
- [x] Route proto-session-run -> proto-run
- [x] ADR/docs/memory path refs
- [x] lint + tsc + tests green

## Summary of Changes

src/modules/session-run -> src/modules/run (git mv); files sessionRun.model->run.model, sessionView.viewmodel->runView.viewmodel; identifiers SessionState->RunState, sessionReducer->runReducer, createSession->createRun, SessionPoll/Option/Status/Action/View->Run*; route proto-session-run->proto-run; story titles Session Run/->Run/; ADR path refs updated + naming note in ADR-005; MEMORY.md updated. Left untouched: mode=session DB value, legacy domains/runs/prototype, old-beans archives. 716 tests, tsc, lint:arch all green.
