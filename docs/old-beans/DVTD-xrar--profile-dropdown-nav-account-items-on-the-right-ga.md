---
# DVTD-xrar
title: 'Profile dropdown nav: account items on the right, gameplay on left, add End Run shortcut'
status: completed
type: feature
priority: normal
created_at: 2026-06-04T09:00:23Z
updated_at: 2026-06-04T09:02:59Z
---

Refactor __root.tsx Navigation to separate gameplay items (left, prominent) from personal/account items (right, behind avatar dropdown). Add quick End Run action so players don't need to navigate to /game-over first.

## Design
- Left (gameplay, primary): Daily Poll · Pipelines · Suggest your own poll
- Right (avatar dropdown): Profile · My Polls · Archive · End Run · Logout
- End Run only enabled when there's an active run
- End Run triggers same ConfirmDialog + finishRunFn flow as /game-over, surfaces gate-1 error inline
- Navigate to /game-over on success (lets player see wrap-up)

## Todo
- [ ] Tiny Dropdown component in src/ui/ (no Headless UI dep; useState + click-outside)
- [ ] useFinishRun hook encapsulating the mutation logic (shared between dropdown and game-over.tsx)
- [ ] Refactor __root.tsx Navigation
- [ ] Verify gate-1 error flows through dropdown End Run path
- [ ] Lint/tsc/test/build all green



## Summary of Changes

- New tiny dropdown primitive: src/ui/Dropdown.component.tsx (no deps; useState + click-outside + escape)
- Shared hook: src/domains/runs/hooks/useFinishRun.ts — encapsulates the mutation, parameterized redirect ('/start' for game-over wrap-up; '/game-over' for dropdown End Run so player sees the wrap-up they earned)
- Refactored __root.tsx Navigation:
  - Left (gameplay): Daily Poll · Pipelines (with (new) badge intact) · Suggest your own poll
  - Right: avatar dropdown → Profile, Archive, My Polls, [End Run if active run], Logout
  - ConfirmDialog reused for End Run; gate-1 server error surfaces inline
- Boy-scout: game-over.tsx now uses the same useFinishRun hook (removes duplicated mutation)
- Lint 0/0, tsc clean, 383 tests pass

## Note
- 'Archive' dropdown entry currently links to /profile/$userId (same destination as Profile). Profile contains the ArchiveSummary section. If you'd rather it scroll to an anchor, that's a small follow-up.
