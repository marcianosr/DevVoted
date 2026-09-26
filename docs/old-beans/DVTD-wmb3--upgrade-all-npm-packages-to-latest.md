---
# DVTD-wmb3
title: Upgrade all npm packages to latest
status: completed
type: task
priority: normal
created_at: 2026-07-03T07:08:56Z
updated_at: 2026-07-03T07:18:22Z
---

Upgrade all outdated dependencies to latest, including major bumps (TS 6, Vite 8, plugin-react 6, jsdom 29, firebase-admin 14, lint-staged 17, @supabase/ssr 0.12, nitro beta). Verify lint + typecheck + build + test after each wave.

## Todo
- [x] Tier 1: safe patch/minor bumps via npm update
- [x] Verify Tier 1 (lint, typecheck, build, test) — fixed Zod v4 message assertion
- [x] Vite 8 + @vitejs/plugin-react 6 (coupled)
- [x] TypeScript 6 — removed deprecated baseUrl from tsconfig
- [x] jsdom 29
- [x] firebase-admin 14
- [x] lint-staged 17
- [x] @supabase/ssr 0.12 — already on getAll/setAll cookie API
- [x] nitro 3.0.260610-beta
- [x] Final full verification — all green

## Summary of Changes

Upgraded all outdated dependencies to latest. Verified after each wave (lint, typecheck, 515 tests, build all green).

**Code changes required:**
- `handlers.spec.ts`: Zod v4 (transitive) reformatted error messages; updated assertion `Expected number` -> `expected number, received null`.
- `tsconfig.json`: removed `baseUrl` (deprecated in TS 6, removed in TS 7); `paths` already use explicit `./src/*` so resolution unaffected.
- Moved `firebase-admin` back to `dependencies` after `--save-dev` misplaced it.

**Notable majors:** TS 6, Vite 8 + plugin-react 6, jsdom 29, firebase-admin 14, lint-staged 17, @supabase/ssr 0.12, nitro beta. nitro beta changed build preview/deploy hints but still emits `.vercel/output` (Vercel preset intact).
