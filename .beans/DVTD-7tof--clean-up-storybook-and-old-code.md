---
# DVTD-7tof
title: Clean up storybook and old code
status: todo
type: task
priority: normal
created_at: 2026-07-21T19:56:09Z
updated_at: 2026-07-25T12:59:41Z
parent: DVTD-u35m
---

Remove unused stories, deprecated components, and dead code from the codebase

## Cleanup Areas

- [ ] Audit and remove unused Storybook stories
- [ ] Identify deprecated or legacy UI components
- [ ] Remove dead code and unused utilities
- [ ] Clean up old domains/ code that has been migrated to modules/
- [ ] Remove any TODO/FIXME comments that are no longer relevant
- [ ] Verify all components still have tests after cleanup

## Note (2026-07-25): old/ routes parked hard

The 8 legacy route files under src/routes/old/ are now @ts-nocheck (typecheck was blocking commits via husky; Marciano chose ignore-over-fix). Their internal cross-links still use pre-move paths, so navigating WITHIN the old flow 404s at runtime — acceptable, they are deletion candidates. An .oxlintrc.json override (src/routes/old/**, ban-ts-comment off) exists and should be deleted together with the folder. Live code no longer depends on the old flow except: useFinishRun/profile End Run (/old/game-over), DevPollNavigator (/old/daily-poll), DailyPollContainer (/old/pipeline-*). Entry points (/ redirect, auth callback, nav) now point at /run.
