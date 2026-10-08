---
# DVTD-mia4
title: Storybook cannot start
status: todo
type: bug
created_at: 2026-10-08T09:43:43Z
updated_at: 2026-10-08T09:43:43Z
---

**What:** Storybook starts and renders every story again.

**Why:** It has failed since 2.0.1, so no screen can be checked visually without hacking its config.

## Done when
- [ ] Storybook starts with the full stories glob
- [ ] A story that renders a component calling a server function still renders
- [ ] Dead harness views that pull in server code are gone

## Notes
Vite's dependency optimisation crawls every story: the config run harness renders PollView, which renders Advertisement.component, which reaches archive.serverfn and @tanstack/react-start; rolldown cannot resolve #tanstack-router-entry without the app plugins (deliberately left out, see .storybook/vite.config.ts). Proposed fix: a Storybook-only Vite plugin that replaces every *.serverfn module with stubs of its exported names (resolveId to a virtual id so the dep scanner never reads the real file). Also delete the unused asReview and asStart in src/test/configRun.harness.tsx. This is a tooling change: confirm before doing it.
