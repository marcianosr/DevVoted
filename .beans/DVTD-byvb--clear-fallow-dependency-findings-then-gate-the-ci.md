---
# DVTD-byvb
title: Clear fallow dependency findings, then gate the CI step
status: completed
type: task
priority: normal
created_at: 2026-09-23T09:26:08Z
updated_at: 2026-09-23T10:35:01Z
blocked_by:
    - DVTD-8z8b
---

`npm run lint:dead` exits 1 on five dependency findings. The CI step in pr-checks.yaml is `continue-on-error: true` until these are resolved; flip it to gating (drop the flag and the comment above it) as the last step.

- [x] `deepmerge` — unused dependency. Only mention is a comment in `src/test/createMockDataFactory.ts:11`. Remove it, and drop it from the Utilities line in CLAUDE.md in the same change.
- [x] `jest-sonar-reporter` — unused devDependency. Overlaps the dead-sonar-stack item in DVTD-4jbz; check there first.
- [x] `zod` — imported in code, missing from package.json. Currently transitive; declare it explicitly.
- [x] `highlight.js` — same, imported but undeclared.
- [x] `nitro` in dependencies but test-only; `dotenv` in devDependencies but used in production. Verify against the Vercel build before moving either.
- [x] Drop `continue-on-error: true` from the Dead code check step in .github/workflows/pr-checks.yaml.

## Summary of Changes

`npm run lint:dead` now exits 0; the CI step in pr-checks.yaml is gating (`continue-on-error` removed).

**package.json**
- `zod ^4.4.3` and `highlight.js ^11.11.1` added to `dependencies`. Both were live in `src/` but only present transitively — zod via `@tanstack/react-start` → `start-plugin-core`, highlight.js via `rehype-highlight` → `lowlight`. Pinned to the versions already resolved in the tree so this change is purely declarative; the build confirms both land in the Vercel server function bundle.
- `dotenv` moved devDependencies → dependencies. `src/database/db.ts` imports `dotenv/config` at production runtime.
- `deepmerge` removed. Genuinely unused; the only mention was a comment in `src/test/createMockDataFactory.ts:11`. CLAUDE.md's Utilities line updated in the same change.

**Reversed from the original plan**
- `jest-sonar-reporter` NOT removed. DVTD-4jbz removed it on 2026-09-19 and restored it the same day on explicit request — Marciano wants the SonarQube stack. Suppressed via `ignoreDependencies` in .fallowrc.json with the reason in a comment instead.
- `nitro` NOT moved. fallow's `test-only-dependency` finding is a false positive: `vite.config.ts` loads `nitro()` behind `mode !== "test"`, and the production build is nitro-driven. Left in `dependencies` (safe under `npm ci --omit=dev`) and the rule left enabled rather than switched off for one bad hit. The warn is expected, and does not gate.

**Verified:** lint 0, lint:dead 0, format:check clean, tsc clean, 3775 tests passed (200 files), production build succeeds.
