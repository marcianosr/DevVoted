---
# DVTD-vrpg
title: Move the local secrets off the repo root
status: todo
type: task
priority: low
created_at: 2026-09-22T18:48:44Z
updated_at: 2026-09-24T12:49:33Z
parent: DVTD-82c4
---

**What:** Move the two credential files out of the repo, and point what uses them at the new place.

**Why:** Live credentials sit in a working directory that agents, editors and build tools all read. They were never committed.

## Done when
- [ ] Both files live outside the repo
- [ ] The Firebase export script still runs from the new location

## Notes

Split out of DVTD-4jbz so a finished hygiene pass could close. This item is local
machine hygiene, not code work.

Two files hold live credentials at the repo root:

- `prod.md`
- `scripts/polls-d8b3d-firebase-adminsdk-cos71-910d48b66d.json`

**This is not a leak.** Both are gitignored (`.gitignore` lists `prod.md` and the bare
JSON filename, which matches at any depth) and `git log --all` on both paths is empty —
they were never committed. Verified 2026-09-22.

The risk is simply that live credentials sit in a working directory that agents, editors
and build tools all read. Move them somewhere deliberate (a password manager, or
`~/.config/`) and point whatever needs them at the new location.

Note the service-account key is still load-bearing: `npm run export:firebase` uses it, and
`import-firebase-polls.ts` exits with a clear message when no backup is found.

- Move `prod.md` off the repo root
- Move the Firebase service-account key and repoint `export:firebase`
