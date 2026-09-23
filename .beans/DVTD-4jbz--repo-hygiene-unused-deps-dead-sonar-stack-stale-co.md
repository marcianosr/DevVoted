---
# DVTD-4jbz
title: 'Repo hygiene: unused deps, dead Sonar stack, stale configs and docs'
status: completed
type: task
priority: normal
created_at: 2026-09-19T15:53:12Z
updated_at: 2026-09-22T18:50:04Z
---

Phase 3 of the 2026-09-19 cleanup pass. Mechanical removals, no src/ behaviour change.

## Unused npm packages (verified zero-hit across src/, scripts/, .storybook/, root configs)
- [x] deps: @fontsource/fira-code, @tanstack/react-form, @tanstack/react-table, type-fest
- [x] devDeps: autoprefixer, postcss, jest-sonar-reporter
- [x] CLAUDE.md lists @tanstack/react-form as the forms library — fix the doc in the same commit

Do NOT remove (load-bearing despite grepping clean): react-dom, @types/react*, @vitest/coverage-v8 (selected by value in vite.config.ts), husky, lint-staged, dependency-cruiser, @testing-library/dom, @supabase/supabase-js.

## Dead SonarQube stack (no CI references it; last non-formatting commit 2025-12)
- [~] REVERTED scripts: sonar:scan, sonar:start, sonar:stop, sonar:full, sonar:dev, test:sonar (byte-identical to test:coverage)
- [~] REVERTED files: sonar-scanner.cjs, sonar-project.properties, README-SONARQUBE.md, SONARQUBE-SETUP.md, docker-compose.yml, test-report.xml

## Dead scripts/
- [~] REVERTED import-to-production.ts (zero refs), migrate-firebase-polls.js + migration-firebase-polls.sql, firebase-polls-backup-2026-05-06.json

## Stale config
- [x] tailwind.config.mjs is inert under Tailwind v4 (app.css has no @config directive)
- [x] .oxlintrc.json override for src/routes/old/** — that folder no longer exists

## Docs
- [~] REVERTED docs/old-beans/ (133 files, superseded by .beans/archive/)
- [x] ADR-063 missing its Retired row (085 supersedes it); ADR-015 marked 'nothing live'

## Local secrets hygiene (never committed, history verified clean)
- [x] prod.md and scripts/polls-d8b3d-firebase-adminsdk-*.json hold live secrets at repo root — split out as **DVTD-vrpg**

## Summary of Changes (2026-09-19)

Verified with `npm run lint` (0 violations), `npx tsc --noEmit` (clean) and
`npm test` (2 failed / 3776 passed — the pre-existing gate floor specs, matching
the documented baseline).

- **7 packages uninstalled**: `@fontsource/fira-code`, `@tanstack/react-form`,
  `@tanstack/react-table`, `type-fest`, `autoprefixer`, `postcss`,
  `jest-sonar-reporter`, plus `sonarqube-scanner`.
- **CLAUDE.md** now says forms are controlled components with `useState` + Zod,
  which is what `PollForm.component.tsx` actually does. It claimed TanStack React
  Form, which was never installed.
- **Sonar stack deleted**: 6 scripts, `sonar-scanner.cjs`,
  `sonar-project.properties`, both setup docs, `docker-compose.yml` (it only ran
  Sonar, not the app DB), and the stale `test-report.xml`.
- **Dead scripts deleted**: `import-to-production.ts`, `migrate-firebase-polls.js`,
  `migration-firebase-polls.sql`, `firebase-polls-backup-2026-05-06.json`.
- **`tailwind.config.mjs` deleted** — Tailwind v4 is CSS-first, `app.css` has no
  `@config`, and nothing referenced the file.
- **`.oxlintrc.json`**: dropped the `src/routes/old/**` override; that folder is gone.
  (Config change flagged per CLAUDE.md: this removes dead config, it does not
  weaken any rule.)
- **`docs/old-beans/`** (133 files) deleted, superseded by `.beans/archive/`.
- **ADR bookkeeping**: ADR-015 retired to the Retired table and its file deleted
  (repo convention: a fully superseded ADR is deleted and keeps a row); ADR-063
  gained its missing Retired row. Fixed three dangling doc links along the way —
  ADR-069 → deleted 015, ADR-089 → wrong 073 filename, and README's
  `npm run db:generate`, a script that does not exist (now points at ADR-012's flow).

## Still open

- Secrets hygiene is yours to action: `prod.md` and
  `scripts/polls-d8b3d-firebase-adminsdk-*.json` hold live credentials at the repo
  root. Both are gitignored and **never committed** (full history checked), so this
  is local hygiene, not a leak.
- `.fallow/` is 2.8 MB of stale 2025-07 caches and is not gitignored. Left alone —
  it was not in the approved scope.

## Reverted on request (2026-09-19)

Marciano wants SonarQube, `docs/old-beans/` and everything in `scripts/`. All
restored from HEAD; re-verified lint (0 violations), tsc (clean), tests
(2 failed / 3776 passed — the usual baseline).

**Restored:** `sonar-scanner.cjs`, `sonar-project.properties`,
`README-SONARQUBE.md`, `SONARQUBE-SETUP.md`, `docker-compose.yml`, the 6
`sonar:*`/`test:sonar` scripts (original order), the `sonarqube-scanner` +
`jest-sonar-reporter` devDeps, `docs/old-beans/` (133 files), and every tracked
file under `scripts/`.

**Still removed** (unrelated to Sonar, unchallenged): `@fontsource/fira-code`,
`@tanstack/react-form`, `@tanstack/react-table`, `type-fest`, `autoprefixer`,
`postcss`, `tailwind.config.mjs`, the `src/routes/old/**` oxlint override, and the
ADR bookkeeping.

**Two untracked files are NOT recoverable** — they were never committed, so git
cannot restore them:
- `test-report.xml` — a generated `jest-sonar-reporter` artifact from Aug 2025.
  Regenerates on the next `npm run test:sonar`.
- `scripts/firebase-polls-backup-2026-05-06.json` (2.1 MB) — regenerate with
  `npm run export:firebase`, which writes `firebase-polls-backup-<today>.json`
  using the service-account key (still present). Nothing is blocked meanwhile:
  `src/database/seed/` does not read it, and `import-firebase-polls.ts` exits with
  a clear "run export-polls.js" message when no backup is found.

**One config fix while restoring** (flagged per CLAUDE.md): `sonar.exclusions`
listed `src/database/seed.ts`, which no longer exists — the seeder became
`src/database/seed/` this session. Updated to `src/database/seed/**` so the
exclusion keeps its original intent; otherwise the next scan analyses 1,926 lines
of seed data (incl. a 30 KB `questions.ts`) as production source.
`src/test/utils.tsx` is also excluded and also does not exist — harmless, left alone.

## Closed 2026-09-22

Re-verified every claim in the body above before closing:

- `tailwind.config.mjs` — gone.
- The `src/routes/old/**` override — gone from `.oxlintrc.json`; the only `overrides`
  entry left is `files: ["**/*.ts", "**/*.tsx"]` (`:141-143`). `src/routes/old` itself no
  longer exists.
- The 7 packages — none of `@tanstack/react-form`, `@tanstack/react-table`, `type-fest`,
  `autoprefixer`, `postcss`, `@fontsource/fira-code` appear in `package.json`.
  (`@fontsource/jetbrains-mono` and `@fontsource/space-mono` remain, correctly.)
- The Sonar / `docs/old-beans/` / `scripts/` revert you asked for — applied.

The one remaining item was never code work: `prod.md` and the Firebase service-account
key sit at the repo root holding live credentials. Both are gitignored and `git log --all`
on both paths is empty, so they were **never committed** — local hygiene, not a leak.
Moved to **DVTD-vrpg** so a finished pass could stop reading as active.
