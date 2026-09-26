---
# DVTD-3o3m
title: Storybook boots the app server through the root vite.config.ts
status: completed
type: bug
priority: normal
created_at: 2026-09-24T07:02:23Z
updated_at: 2026-09-24T07:05:00Z
---

Storybook merges the root vite.config.ts by default, so TanStack Start, Nitro and Sentry run inside Storybook's process. Nitro eagerly loads the server entry: 33 'Failed to load source map' stack traces for @tanstack/start-server-core on every start, the router generator rewrites src/routeTree.gen.ts from two processes ('modified by another process'), and Storybook pays for the whole server boot. Stories themselves are fine: all 544 render under jsdom and every module serves 200.

- [x] Give Storybook its own .storybook/vite.config.ts (alias, React, Tailwind only)
- [x] Point framework.options.builder.viteConfigPath at it and drop viteFinal
- [x] Verify: clean start log, all story modules 200, build-storybook

## Summary of Changes

- `.storybook/vite.config.ts`: `~` alias, `@vitejs/plugin-react`, `@tailwindcss/vite`. No `define`: the build globals are read only by `instrument.*.ts` and `Footer.component.tsx`, which no story imports.
- `.storybook/main.ts`: `framework.options.builder.viteConfigPath` points at it; the `viteFinal` that pushed Tailwind is gone.

Verified: dev start on 6007 with 0 source-map warnings and no Nitro/Vercel lines, preview ready in 120 ms (was 710 ms); all 265 modules reachable from the 104 story files serve 200; all 544 stories render under jsdom; `storybook build` completes in 2.2 s (it failed with rolldown "multiple entries detected" before, so that was the app plugins too); `npm run lint` green.

Not changed: the root `vite.config.ts`.
