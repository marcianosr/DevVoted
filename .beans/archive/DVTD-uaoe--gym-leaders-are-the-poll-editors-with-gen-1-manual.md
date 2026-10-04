---
# DVTD-uaoe
title: Gym leaders are the poll editors, with gen-1 manual avatars
status: completed
type: task
priority: normal
created_at: 2026-09-21T10:28:39Z
updated_at: 2026-09-21T10:31:42Z
---

Drop Janine (gen 2, not a Kanto gym leader). Make SEED_CLIMBERS the eight gen-1 gym leaders in badge order, and move the playable logins to the Elite Four + Blue so no name appears twice. Add a photoUrl to the climber cast and seed it into users.photo_url, pointing at Ken Sugimori gen-1 manual portraits in public/editors/.

- [x] Crop the eight portraits into public/editors/
- [x] Swap SEED_PLAYERS to Elite Four + Blue
- [x] Swap SEED_CLIMBERS to the eight gym leaders, badge order as ladder order
- [x] Add photoUrl to SeedClimber and write it to users.photo_url
- [x] Drop the janine fixture from community.service.spec.ts
- [x] lint + typecheck + tests

## Summary of Changes

The casts swapped rather than merged: a gym leader who was also a playable login would climb the community board against itself, and the `you` highlight would pick the wrong row.

- `src/database/seed/cast.ts` — `SEED_PLAYERS` is now Lance (admin) / Agatha / Lorelei / Bruno (poll-editor role) / Blue, keeping the same five build archetypes and the same `playerUUID` slots. `SEED_CLIMBERS` is the eight gen-1 gym leaders in reverse badge order, so the community ladder reads as the badge ladder: Giovanni at the top, Brock at the foot. Janine is gone (gen 2), as are Bill, Daisy Oak and Prof. Oak.
- `SeedClimber.photoUrl` is required, not optional: a poll editor without a face would silently fall back to initials, and the type is the only place that catches it. Values come from `portraitOf(slug)`, deliberately NOT derived from `githubUsername` — a handle rename would 404 the avatar with no error.
- `src/database/seed/index.ts` — `seedClimbers()` writes `photo_url`. The column existed and the whole read chain (repository → service → `CommunityView.component.tsx` → `Climber.ui`) was already wired; only the write was missing.
- `public/editors/*.png` — eight 128×128 portraits cropped from the Ken Sugimori gen-1 manual plate. Tile bounds were found by scanning the plate for columns and rows whose pixels differ from the paper ground, not by eyeballing a 4×2 split (the portraits are not centred in their cells). Source was a low-res thumbnail; swap in higher-res art any time, the paths do not change.
- `community.service.spec.ts` — the nameless-account fixture is `misty`, not `janine`.
- `README.md` — the login table lists the new five, plus a line saying the leaders author the polls and have no login.

Verified: `npx tsc --noEmit` clean, `npm run lint` clean (2 pre-existing story warnings, no dependency violations), `npm test` 3846 passed / 2 failed — the two failures are the known pre-existing gate floor specs on this branch.

Not done: `npm run db:refresh` has not been run, so the local database still holds the old cast.
