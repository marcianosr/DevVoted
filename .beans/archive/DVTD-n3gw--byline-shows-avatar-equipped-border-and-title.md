---
# DVTD-n3gw
title: Byline shows avatar, equipped border and title
status: completed
type: feature
priority: normal
created_at: 2026-09-06T10:48:00Z
updated_at: 2026-09-06T11:02:58Z
---

The poll byline reads 'Created by @matthijsgroen' with an '@' initial in a circle. Show the author's real avatar with their equipped border, and their title (poll-editor / admin) when they have one.

- [x] terminal-theme Byline takes avatarUrl / borderUrl / title as plain props
- [x] Poll author widens from a string to an author object through the repository, engine poll, answer and pollView viewmodel
- [x] PollView + RevealView wire it
- [x] Stories + specs
- [x] lint, typecheck, tests

## Summary of Changes

- New `PollAuthor` in `runPoll.model.ts` (`handle` / `avatarUrl` / `borderUrl` / `title`) replaces the bare handle string on `RunPoll`, `AnsweredPoll` and `PollView`.
- `runPolls.repository.ts` joins `photo_url`, `equipped_border_id` and `role`, resolves the border id through the existing catalog, and maps the role enum to a title (poll-editor -> Poll editor, admin -> Admin, user -> none).
- `Byline.ui.tsx` draws a square 32px avatar (border art is square 224px PNG, a circle would clip it) with the border scaled 120% over it, falling back to the handle initial. Its props were renamed author -> handle so `PollAuthor` is structurally assignable and no mapper is needed at either wiring site.
- `hydrateRunState` re-reads answered polls' authors off the day's polls, the same rule the file already applies to the roster. Keeps the credit current when a player changes their border, and snapshots holding the old string shape self-heal.

Verified: lint clean, 3601 tests pass. Two pre-existing issues are NOT from this bean: the 3 RewardScreen.spec.tsx failures (confirmed at HEAD in a worktree) and a `coverage: coverageFor(view)` line commented out in ShopView.component.tsx mid-session, leaving that import unused.
