---
# DVTD-at5o
title: Poll byline fabricated its avatar from the handle
status: completed
type: bug
priority: normal
created_at: 2026-09-21T10:39:40Z
updated_at: 2026-09-21T10:50:56Z
---

The kanto `Author` byline built its avatar URL as `https://github.com/{handle}.png` instead of reading `users.photo_url`, so a seeded editor showed a stranger's GitHub identicon.

## Summary of Changes

`users.photo_url` is the source of truth for every avatar, including real users': `auth.serverfn.ts` writes Supabase's `user_metadata.avatar_url` into it on first sign-in, which for a GitHub login already *is* the GitHub avatar. Deriving the URL a second time from the handle bought nothing and broke whenever a seeded handle collided with a real GitHub account — `@sabrina` rendered a stranger's identicon.

- `Author.ui.tsx` — takes `photoUrl?: string`; `githubAvatarUrl` and `GITHUB_AVATAR_HOST` deleted. No photo now means no `<img>` at all, leaving the handle's initial that was always sitting behind it.
- `PollView.component.tsx` — `authorOf` passes `poll.author.avatarUrl` through as `photoUrl`. The repository already selected `photo_url` into `PollAuthor.avatarUrl`; the presenter was dropping it.
- `Author.spec.tsx` — the `githubAvatarUrl` block is gone. New scenarios: draws the photo it is handed, and leaves the initial bare with no `<img>` when there is none. The border specs now pass a photo, since "border over the avatar" needs both images to be meaningful.
- `Author.stories.tsx` / `PollScreen.stories.tsx` — carry a portrait. `AvatarFallback` used to rely on a nonexistent GitHub account 404-ing; it now just omits `photoUrl`, which is the real fallback path.

Verified: `npx tsc --noEmit` clean, `npm run lint` clean, `npm test` 3845 passed / 2 failed (the known pre-existing gate floor specs).

Blocked on a reseed: the local database still holds `photo_url = null` for every row, so the byline shows a bare initial until `npm run db:refresh` runs.

## Follow-up: bigger avatars, and leaders wear a border

- `Author.ui.tsx` — `sm` 20px to 28px, `md` 32px to 40px. The `FRAME` overlay is `scale-120`, so at 20px a border was drawing into roughly four pixels of margin; 28px is the point where the art reads.
- `SeedClimber.borderId` — each leader owns exactly one border and has it equipped. The eight themed SVG borders happen to carry kanto city colours, so the mapping is by city, not by whim: Brock pewter, Misty cerulean, Lt. Surge vermillion, Erika celadon, Koga fuchsia, Sabrina saffron, Blaine cinnabar. Giovanni takes the leftover lavender, Viridian having no border of its own.
- `seed/index.ts` — writes `owned_border_ids` and `equipped_border_id`. The read chain was already whole: `runPolls.repository` resolves `equipped_border_id` through `findBorderById`, and `PollView`'s `authorOf` was already forwarding `borderUrl`.
- `src/database/seed/cast.spec.ts` (new) — `borderId` and `photoUrl` are both bare strings that fail silently: an unknown border id resolves to `undefined` and simply draws nothing, and a missing portrait falls back to the initial. Three specs pin them, plus one that no climber shares a name with a playable login. Mutation-checked: swapping Brock's border for a bogus id fails the suite and names Brock.

Verified: `tsc --noEmit` clean, `npm run lint` clean, `npm test` 3848 passed / 2 failed (the known pre-existing gate floor specs).
