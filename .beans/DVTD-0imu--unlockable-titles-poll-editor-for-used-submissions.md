---
# DVTD-0imu
title: 'Unlockable titles: Poll Editor for used submissions'
status: completed
type: feature
priority: low
created_at: 2026-09-06T12:14:49Z
updated_at: 2026-09-24T15:58:25Z
---

Cosmetic account titles earned through play, starting with "Poll Editor": granted when 5 polls you submitted get used in the mix (drawn into daily_polls / served in runs). Decided 2026-09-06: title is DISPLAY-ONLY — the poll-editor permission role stays admin-assigned; the earned title needs its own concept (rename or a titles table) so it does not collide with UserTitle's role labels.

## Why it is not in the config-unlock ledger

The metric fires outside the earning user's session (someone else's run / the daily draw uses your poll), so it cannot ride objectiveIncrementsFor at the dispatch seam. It is a derived count over polls.created_by joined against usage — evaluate on read or on the daily-mix draw, not per run action.

## Open questions

- Prerequisite: no public poll-submission flow exists — only poll-editors/admins create polls today, which makes the objective circular until submission ships.
- Announce surface: gate-clear/game-over do not fit an out-of-session grant; profile/Dex badge or a site-level "since you were away" line?
- Locked-title display: ??? row in a Dex tab, or profile-only?
- Storage: user_title_unlocks table vs derived-on-read (derived loses unlocked_at + the announce moment).

## Summary of Changes

Built as ADR-109. The old `awards` shape was inverted: its predicate took every
user and returned winners, which is a standing (the category seat, ADR-103) and
cannot be permanent. A title is now a predicate over one account's own record,
written once to a ledger and never asked again.

**Roster** — 12 category Maintainers (25 correct in that category), Completer
(a correct answer in all twelve), Summit (clear thirteen gates), Flawless (20
perfect windows), First Ascent (race: first account ever to summit), Legacy
Tester (granted, unearnable).

**Storage** — `user_titles (user_id, title_id, exclusive, earned_at)` plus
`users.equipped_title_id`. Migration `20260924120000_add_user_titles.sql`,
guarded per ADR-012. A race title is settled by a partial unique index on
`title_id WHERE exclusive`, not by an "am I first?" read.

**Grant path** — `titlesEarnedBy` is the twin of `configsUnlockedBy`. It runs at
the run-end seam in `applyActionToRun`, not per answer: the objective upsert's
RETURNING holds only the metrics one action touched, which cannot answer
"a correct answer in every category", and run-over is where titles are announced
anyway. One read, one insert per run.

**`title` freed from the role** — `PollAuthor.title` → `role`, `ROLE_TITLES` →
`ROLE_LABELS`. The role keeps the handle line; the earned title gets its own
line beneath it.

**Surfaces** — profile (worn title + a shelf listing locked titles with their
bars), the poll byline via `Author.ui.tsx`, and the open build via
`AttackPanel.ui.tsx`. Climb chips deliberately untouched. Wiring the open build
also fixed `AttackPanel` passing no `photoUrl`/`borderUrl` — every rival on the
ADR-101 surface was faceless.

**Also** — `runs-won` added as a cumulative objective metric (`gates-cleared`
counts across runs and can never say thirteen fell in one). The shared Drizzle
test mock now resolves an exhausted queue to `[]` rather than `undefined`, since
a real query always returns an array.

**Verified** — 3718 tests pass (195 files), typecheck clean, `npm run lint`
clean including `lint:arch` and `docs:check`.

**NOT verified** — the migration has not been applied to any database. Both the
write and the read against the local Supabase were blocked by the sandbox as
deploy/production actions, so `npm run db:refresh` and a live click-through of
the profile, byline and attack panel are still outstanding.

## Follow-ups

- Apply the migration locally and run `npm run db:refresh`; the seed now grants
  titles to Lance, Agatha and Bruno, and leaves Blue bare on purpose.
- `DVTD-n1pr` should drop its "one nullable column is enough" note: Legacy Tester
  is a granted title in this system now. Its cohort question is still open.
- `ProfilePage` still heads other players as `Profile: <uuid>` and predates the
  kanto kit — left to `DVTD-8kiu`.
- The title line and the gate label in `AttackPanel` share a class string
  (`text-xs text-theme-muted`), so nothing distinguishes identity from location
  visually.
