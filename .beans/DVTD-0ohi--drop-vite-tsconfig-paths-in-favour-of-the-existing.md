---
# DVTD-0ohi
title: Drop vite-tsconfig-paths in favour of the existing resolve.alias
status: completed
type: task
priority: normal
created_at: 2026-09-23T08:49:53Z
updated_at: 2026-09-23T08:52:00Z
---

Vite 8 logs a notice that vite-tsconfig-paths is redundant. In this repo it is doubly redundant: vite.config.ts already declares `~` and `@/src` in resolve.alias, and Storybook's builder-vite loads that same vite.config.ts via loadConfigFromFile, so .storybook/main.ts pushing the plugin adds nothing.

- [x] Remove plugin + import from vite.config.ts
- [x] Remove plugin + import from .storybook/main.ts
- [x] npm uninstall vite-tsconfig-paths
- [x] Verify aliases still resolve (tests + dev server boot)

## Summary of Changes

Removed `vite-tsconfig-paths` from `vite.config.ts`, `.storybook/main.ts`, `package.json` and the lockfile. Alias resolution now comes solely from `resolve.alias` in `vite.config.ts` (`~` and `@/src`), which Storybook inherits because builder-vite loads the root vite config itself.

Verified: dev server boots without the notice and SSRs `/login` (200), 3776 tests pass in 201 files, `npm run lint` clean, `npx tsc --noEmit` exit 0, `npm run build` succeeds.
