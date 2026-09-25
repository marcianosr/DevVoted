---
# DVTD-n1dn
title: Prepare the production deploy for 2.0
status: todo
type: task
created_at: 2026-09-25T15:50:28Z
updated_at: 2026-09-25T15:50:28Z
parent: DVTD-u35m
---

**What:** Walk the whole path from main to a live 2.0 release once, and fix what the walk finds.

**Why:** Everything since the last version is one unreleased block, and the automation that cuts a version cannot produce a major one.

## Done when
- [ ] Cutting a major version needs no hand-editing on the day
- [ ] The release notes read as one coherent 2.0, not a year of appended entries
- [ ] Every pending migration is confirmed to apply to the live database, in order
- [ ] The written release guide matches what the workflows actually do
- [ ] Anything the walk finds broken has a bean of its own

## Notes

Releasing is already automated end to end (`docs/production-release.md`): merging to
`main` runs `.github/workflows/main.yaml`, and `release.yaml` cuts the version on
demand. This bean is the rehearsal, not new pipeline work.

Four things found while scoping it:

**The bump decision has no major.** `scripts/release.ts` delegates to
`release-decision.ts`, which returns **minor** when `Added`/`Removed` entries exist
and **patch** otherwise. There is no path that produces `2.0.0`. Either the decision
learns a major trigger (a `BREAKING` section, or a `major` workflow input), or the
2.0 tag is cut by hand once and the automation resumes afterwards. Decide which
before the day, not on it.

**`Unreleased` is the entire rebuild.** The last release is `1.3.0 - 2026-07-06`;
everything since sits in one `## Unreleased` block that is hundreds of lines of
`Added`. As release notes for 2.0 it is unreadable, and some of it describes systems
that were reversed since it was written. DVTD-d1ei already covers entries that still
describe the slot ladder. A pass to merge, cut and reorder into a 2.0 that a player
can read is part of this.

**The guide and the workflow disagree.** `docs/production-release.md` says merging to
`main` "deploys it (Vercel) and applies database migrations (`main.yaml` runs
`supabase db push`)". `main.yaml` has exactly one job, `migrate`, and it only pushes
migrations — the Vercel deploy comes from Vercel's own git integration, not from this
workflow. Per the docs boyscout rule, fix the doc in the same pass.

**Migrations are guarded but unrehearsed.** `supabase/migrations/` carries the legacy
title grants, the archive bonus and the service unlocks — data migrations that run
once against real accounts. They have specs, but nobody has watched them apply to
production. Confirm the ordering and that each is genuinely idempotent before the
release runs them unattended.

Related, not absorbed:
- DVTD-k8rp — post-deploy checks for the observability work
- DVTD-d1ei — unreleased entries still describe the slot ladder
- DVTD-929w / DVTD-lzds — dropping the old game's tables
