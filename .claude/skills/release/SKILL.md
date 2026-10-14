---
name: release
description: Ship the current branch to production and cut a DevVoted version - commit, push, PR, merge, migration check, Release workflow, verify. Use when the user says "release this", "ship it", "release on the next patch", "cut a version" or "release as a new feature".
argument-hint: [patch | feature]
---

# Release

Merging to `main` deploys production: Vercel builds, and `main.yaml` ("Release (Production)") runs `supabase db push` against prod. `release.yaml` ("Release (Version Bump)", manual) turns `## Unreleased` into a version, bumps `package.json`, tags and publishes the GitHub release. Nothing here can be undone cheaply, so check before every step and stop on anything unexpected.

## 1. Version: the changelog decides

`npm run release -- --dry-run --json` prints `bumpType` and `newVersion`.

- Any `### Added` or `### Removed` entry → **minor**. Only `### Changed` / `### Fixed` → **patch**. There is no major.
- If the user asked for a patch but the dry run says minor, say which Added entries cause it and ask: move them, or accept the minor. Never hand-write a version heading or touch `package.json`.
- Entries outside a `###` heading make the script exit 1. Fix the changelog (`docs/changelog-maintenance.md`), don't work around the check.

## 2. Migrations: compare the diff with prod

List migration changes against main: `git diff --name-status origin/main -- supabase/migrations`.

Read prod's history (reads pass the allow rule when run bare):
`supabase db query --linked "select version, name from supabase_migrations.schema_migrations order by version desc limit 10"`

- A **deleted or renamed** migration that prod already ran breaks `db push`. Stop and tell the user.
- A **new** migration runs on merge. Name it in the summary so the user knows prod's schema changes.

## 3. Verify, then commit

- Run `npm run lint`, `npx tsc --noEmit` and `npm test`, and report the pass counts. A red check stops the release.
- `git status`: the tree can hold another session's work. Ask whether everything goes in if anything looks unfinished or unrelated.
- Commit in a conventional style (`feat:` / `fix:`), with no co-author line. The pre-commit hook runs oxlint, prettier and tsc. If it fails, fix the cause and make a new commit, never `--no-verify`.

## 4. Push

SSH push fails in Claude's shell (the key isn't loaded). Push over HTTPS with gh as a one-off credential helper, which leaves git config untouched:

```
git -c credential.helper= -c credential.helper='!gh auth git-credential' push https://github.com/marcianosr/DevVoted.git <branch>
```

## 5. PR

- `gh pr list --head <branch>` first. An open PR may already exist with a stale title: update it with `gh pr edit` instead of creating a second one.
- The body states what ships, the new migration, the version the dry run predicts, and the check counts.
- Wait for `quality-checks`, `check-version` and Vercel: `gh pr checks <n> --watch` in the background. Don't merge on anything but green.

## 6. Merge and release: the user runs these

The auto-mode classifier blocks `gh pr merge` and `gh workflow run`. Hand them over in order:

1. `! gh pr merge <n> --merge`
2. Wait for `main.yaml` to finish green: `gh run list --workflow main.yaml --limit 1`. This is the prod migration; a failure here means stop, not release.
3. `! gh workflow run release.yaml --ref main`

## 7. Verify

- Migration: rerun the step 2 history query, and confirm every new migration is listed.
- Release: `gh run watch <id> --exit-status`, then `gh release view --json tagName,publishedAt`. The tag must match the dry run's `newVersion`.
- Report: the version, the tag time, the migrations applied, and anything left open.
