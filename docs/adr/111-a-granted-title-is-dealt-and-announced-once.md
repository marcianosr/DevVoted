# ADR-111: A granted title is dealt by a migration and announced once

## Status

Accepted — 2026-09-24 (Marciano, DVTD-n1pr). Completes
[ADR-109](109-a-title-is-earned-and-worn-one-at-a-time.md), which defined a
`granted` title and left nothing able to award one.

## Context

`Legacy Tester` shipped in the catalogue, in the changelog and in the wiki, with
`earn: { kind: "granted" }`. `isSatisfied` returns `false` for that kind by
design, so the run-end grant path structurally cannot award it. The reward was
announced to players and reachable by nobody.

The cohort it names — the accounts that played the calendar game — is also
frozen. Nobody can join it, and nothing they did was counted: the objective
ledger only starts at its own migration, 2026-09-06.

## Decision 1: the predicate is a run, not an answer

The calendar game and the rebuild share the `runs` table, discriminated by
`mode`. "Played the old game" is a row there, which is a stronger claim than an
answered poll: it says you started something.

`status` splits it into two tiers. A calendar run still `active` when the
rebuild landed is a climb the cutover ended, and it earns a second title the
wider tier does not get.

## Decision 2: the id names the predicate when the name is unsettled

`user_titles.title_id` is what the ledger stores; the display name is only ever
resolved for rendering. So a title whose name is still being argued about takes
an id describing who gets it — `title-legacy-active` — and the label can change
later with no migration and no orphaned rows.

This is a deviation. Every other entry mirrors its name (`title-summit` /
`Summit`), and should go back to that once a name settles.

## Decision 3: the grant is a migration, and the notice is only a report

The grant is true before anyone logs in. A player who never opens the rebuild
still holds and wears the title, so the notice must never be the thing that
grants — or a player who misses it is never paid.

The migration equips through `coalesce`, so the reward is visible at first
sight without overriding a title somebody already chose.

Three orderings inside it are load-bearing, and each failure is silent:

1. `announced_at` and its backfill ride the same file as the grants. Split
   apart, there is a window where every already-earned title reads as
   unannounced and the notice fires for all of them.
2. The backfill runs **before** the inserts, and excludes the two legacy ids.
   Reversed, it stamps the new grants as already seen and nobody is told; and
   without the exclusion, a second application buries a grant nobody opened.
3. The runs are closed **last**. The second tier reads `status = 'active'`, so
   archiving first grants it to nobody.

`exclusive` is false on both rows. The partial unique index treats an exclusive
title as a race exactly one account in the database may win, which would hand
the reward to whichever insert landed first and report success.

## Decision 4: a granted title is invisible to everyone outside its cohort

`visibleTitles` drops a `granted` title the account does not hold. An earned
title stays listed while locked because its line is the bar somebody can work
towards; a granted one has no bar, so listing it offers nothing and advertises a
closed cohort.

## Decision 5: the announce surface is a modal, on every authenticated screen

ADR-109 said the run-over screen announces a title. It does not — `earnedTitleIds`
is computed at run end, threaded into the run view, and rendered nowhere. So
earned titles had no announce surface either, and one mechanism now covers both.

The seen-flag is a nullable `announced_at` on the ledger row: one flag per
grant, surviving days and runs, written by the same insert. `users.last_seen_at`
is a daily heartbeat and says nothing about having read anything, and the visit
table rotates its hash daily by design — [ADR-104](104-visits-are-counted-without-a-banner.md)
also states that nothing on that path may ever be seen by a player.

Only the titles actually shown are stamped. One earned while the notice is open
has not been seen, and stamping it would bury it behind a modal already closed.

It mounts on the `_authed` layout rather than the run hub: every login path ends
at `/run`, but a player who lands deeper still deserves the notice.

## Consequences

- `completion_reason` gains a fourth value, `archived`. No typed reader sees it:
  every run-loop and community query filters to session runs first.
- The admin screen counts active runs without filtering `mode`, so its number
  drops when the calendar runs close. That is the intended reading.
- Migrations never run locally, so the seed reproduces the era the migration
  leaves behind. The SQL itself stays hand-verified, guarded by a spec that
  reads the file and asserts the three orderings above.
