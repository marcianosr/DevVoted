---
# DVTD-6dax
title: Skip proto-run, scripts and old-theme across all fallow surfaces
status: completed
type: task
priority: normal
created_at: 2026-09-23T11:34:34Z
updated_at: 2026-09-23T11:46:22Z
---

`ignoreFindings` covers only dead-code findings, so scripts/ still surfaced in Duplication, Complexity and Hotspots. Added `duplicates.ignore` and `health.ignore` alongside it for `src/routes/proto-run.tsx`, `scripts/**` and `src/ui/old-theme/**`.

## Summary of Changes

.fallowrc.json now names the three paths on three surfaces. Deliberately NOT added to `ignorePatterns`: that drops files from the module graph and would re-break dependency accounting (firebase-admin, keep-a-changelog). Verified the Dependencies section is unchanged — only the known nitro false positive remains.

| | before | after |
|---|---|---|
| files analyzed | 722 | 618 |
| maintainability | 91.7 | 91.3 |
| LOC | 96,110 | 87,976 |
| high-complexity functions | 79 | 70 |
| clone groups | 33 | 26 |
| duplicated lines | 1,166 (2.0%) | 693 (1.4%) |
| refactoring targets | 13 | 10 |
| churn hotspots | 1 | 0 |

MI moved down, not up: the excluded files scored slightly better than average, so this is not scoreboard-gaming.

`npm run lint:dead` still exits 0, so the gating CI step is unaffected. The full `fallow -r .` audit still exits 1 (duplication and complexity findings outside the skipped paths); wiring that into CI would be separate work.

## Follow-up (DVTD-6crx, 2026-09-23)

`src/ui/old-theme/**` was dropped from all three surfaces (`ignoreFindings`, `duplicates.ignore`, `health.ignore`): the directory is deleted, so the pattern matched nothing and fallow said so on every run. `scripts/**`, `src/presentation/**` and `src/routes/proto-run.tsx` are untouched.

That deletion also made `class-variance-authority` genuinely unused — only old-theme's `Button` used `cva` — so fallow's Dependencies section caught it and it left package.json.
