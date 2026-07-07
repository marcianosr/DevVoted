# Production release

Releasing is automated. Your only ongoing job is keeping the changelog current;
cutting a version is a single button.

## What you do

### 1. While developing (every PR)

Add player-facing entries under `## [Unreleased]` in `CHANGELOG.md`, following
[changelog-maintenance.md](changelog-maintenance.md). On each PR the **PR Checks**
workflow comments with the version a merge would produce.

Merging a feature PR to `main` deploys it (Vercel) and applies database migrations
(`main.yaml` runs `supabase db push`). This is a deploy, **not** a version release.

### 2. When you want to cut a version

GitHub → **Actions** → **Release (Version Bump)** → **Run workflow**.

That's it. If `[Unreleased]` has entries, the workflow will:

- decide the bump — **minor** if there are `Added`/`Removed` entries, else **patch**;
- rewrite `[Unreleased]` → `[x.y.z] - <date>` and open a fresh empty `[Unreleased]`;
- bump `package.json`, commit to `main`;
- create the `vX.Y.Z` tag and a **GitHub Release** with notes from the changelog;
- trigger the production deploy (`main.yaml`).

If `[Unreleased]` is empty, it no-ops.

## What you never do anymore

- Pick a version number by hand (the changelog decides).
- Edit the changelog release heading, or write release notes twice.
- Run `npm version`, `git tag`, or `gh release create` manually.

## Fallback: manual migration

Migrations normally run via `main.yaml`. To apply one by hand:

```bash
npm run db:generate          # review SQL in drizzle/
psql "postgresql://postgres.smrkmigjsnhrhwrxobjc:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres" \
  -f drizzle/XXXX_migration_name.sql
```
