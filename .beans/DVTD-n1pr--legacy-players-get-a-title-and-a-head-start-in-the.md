---
# DVTD-n1pr
title: Legacy players are granted a title, two tiers deep
status: in-progress
type: feature
priority: high
created_at: 2026-09-24T13:23:53Z
updated_at: 2026-09-25T09:08:24Z
parent: DVTD-z2r2
---

**What:** Every account that played the calendar game is granted a permanent title, and one that was still mid-run when the rebuild landed is granted a second, rarer one.

**Why:** Nothing else survives the 2.0 cutoff, so the people who played the old game arrive as brand new accounts.

## Done when
- [x] An account that played the calendar game holds a title no later account can ever earn
- [x] An account whose run was still open when the rebuild landed holds a second title the first tier does not
- [x] Nobody outside the cohort sees either title offered, listed, or hinted at
- [ ] A returning player is told once what they were granted, and can still read it on the profile afterwards
- [x] Running the grant twice changes nothing and never overwrites a title already worn
- [x] The runs the grant closes cannot be resumed and cannot appear on the community board

## Notes

### The cohort, settled 2026-09-24

Eligibility is a row in `runs` from the calendar era, not an answered poll. The two
eras share that table and `mode` discriminates them; `status` splits the tiers.

| tier | predicate | grant |
| --- | --- | --- |
| played | `mode = 'calendar'` | `title-legacy-tester` |
| caught mid-climb | `mode = 'calendar' AND status = 'active'` | `title-legacy-active` |

Tier 2 is a subset of tier 1, so that cohort holds both rows and wears the rarer one.

This replaces the earlier `polls_responses.mode = 'calendar'` seam, and it answers the
"two readings" question below: reading 1, calendar-era only.

### The title system already exists

DVTD-0imu built it as ADR-109, which stales this bean's earlier note that there was
nothing to hang a title on. `Legacy Tester` is already in the catalogue as a granted,
unearnable title, already in the changelog and already in the wiki. What is missing is
anything that awards it: granted titles are deliberately unreachable from the run-end
grant path, so a migration is the only route.

### The name of the second title is not settled

It ships under a working name. The id is what the ledger stores and the name is only
ever resolved for display, so the id names the predicate (`title-legacy-active`) and
the label can change later without a migration.

### The grant closes the runs it pays for

Same migration, after the inserts — closing first would empty the tier-2 predicate.
Archived calendar runs cannot leak onto the community board: every climber query
filters to session runs and inner-joins a state row that calendar runs never had.

Auto-equip via `coalesce` so the reward is visible to a player who never opens the
notice, and so it never overrides a title somebody already chose.

### The notice is a report, not the moment of granting

The grant is a migration, so it is already true before anyone logs in. A player who
never opens 2.0 still holds and wears the title. The notice must therefore never be
the thing that grants.

- It shows once, so it needs its own seen-flag. `last_seen_at` cannot serve — it is
  written at most once per account per day and says nothing about having read this.
- No route of its own. A returning player already lands somewhere; show it there.
- Copy lives in a `COPY` object in the `.ui.tsx` per ADR-102, with the counts arriving
  as plain data props. The notice renders what it is handed; it counts nothing.

The seen-flag is a nullable `announced_at` on the ledger row. That also covers titles
earned at run end, which are computed and threaded into the run view today and
rendered nowhere.

### Deferred: the archive credit

Dropped from this pass, not cancelled. A one-off archive credit is spendable, and by
the reasoning below it reverses half of the 2026-09-09 cosmetic-only decision the
moment the archive buys run power. It needs its own call.

`archived_storage` is **bytes** (bigint, so long-tail accounts can pass int32);
`peak_storage_kb` is **KB**. A grant authored in KB is 1024x short. The grant must also
leave `peak_storage_kb` alone: it is a high-water mark of storage *held in a run* and
it reveals storage plan rungs. An archive gift is not a run, and raising it would
unlock plan rungs nobody played for.

`archived_storage` has exactly one spend surface (`buyBorder` in
`account/profile/infrastructure/profile.repository.ts`), so a grant currently buys
borders and nothing else. Size any future grant against what the archive will buy at
2.0, not what it buys today.

### Deferred: the fuller return notice

The original draft copy, kept because the framing is right even though the counts are
not being built:

> DevVoted has been rebuilt. Your previous runs have entered the archive.
>
> Kept: 143 poll records · 6 config grants · Legacy Tester border
>
> Granted: 256 KB archived storage
>
> New runs begin under the current rules.

Every figure in it needs a query written for one screen, and the calendar game had no
configs, so that line would read "0 config grants". The opening line frames the cutoff
as an archiving rather than a wipe and the closing line is the balance disclaimer —
both worth keeping when the copy is written.

| line | source |
| --- | --- |
| poll records | count of the account's `polls_responses` rows in the frozen era |
| config grants | rows in `user_config_unlocks` for the account |
| Legacy Tester border | the DVTD-jwt1 grant, read off `owned_border_ids` |
| 256 KB | `formatStorage(262144)` from `shared/lib/storage.ts` |

### Related

DVTD-jwt1 pays the same cohort a founding border and stays open. It can ride this
migration: same table, same predicate, so the eligibility query is written once.

## Todo

- [x] Second granted title in the catalogue, under a working name
- [x] `visibleTitles` so a granted title is invisible to accounts that do not hold it
- [x] `announced_at` on the ledger row, plus the read and the stamp
- [x] The one-time modal, mounted where every authenticated screen sees it
- [x] Guarded grant migration: insert, equip, then close the runs
- [x] Seed a calendar-era archetype so both tiers are demoable locally
- [x] ADR-111, wiki §6.6, CHANGELOG
- [x] lint, typecheck, tests

## Summary of Changes

Built as **ADR-111**, which completes ADR-109 rather than amending it: 109 defined a
`granted` title and left nothing able to award one, because `isSatisfied` returns
false for that kind by design.

**The cohort** is `runs.mode = 'calendar'`, and `status = 'active'` splits the second
tier. `title-legacy-active` joins the catalogue under the working name *Legacy
Climber* — the id names the predicate because the ledger stores the id and only the
display name is still open.

**The grant** is one guarded migration. Three orderings in it are load-bearing and
every one of them fails silently, so `grantLegacyTitles.spec.ts` reads the SQL off
disk and asserts them: the `announced_at` backfill runs before the inserts and skips
the two legacy ids, the tier-2 insert runs before the close, and neither row is
`exclusive` — the partial unique index would otherwise hand the reward to whichever
account inserted first and report success.

**The notice** is the kit's `Modal`, in production for the first time, mounted on the
`_authed` layout. The seen-flag is `announced_at` on the ledger row, and only the
titles actually shown are stamped: one earned while the notice is open has not been
seen. This also closes a gap nobody had filed — `earnedTitleIds` is computed at run
end, threaded into the run view and rendered nowhere, so earned titles had no
announce surface either.

**Two pre-existing bugs found on the way.** `src/database/reset.ts` never dropped
`user_titles`, `audit_incidents` or `app_visits`; seeded UUIDs are deterministic, so
stale rows survived `db:reset` and re-attached to the fresh accounts — an already
stamped grant would have made the notice look broken on the second refresh. Fixed
here. And `__root.tsx` builds its `QueryClient` inside the component body, so every
re-render mints a new one and drops the cache; left alone, flagged below.

**Verified** — 3737 tests pass (196 files), typecheck clean, `npm run lint` clean
including `lint:arch` and `docs:check`. The release gate accepts the changelog entry
at a minor bump.

**Verified against the database** — `npm run db:refresh`, then the migration SQL
executed twice against local Postgres:

| account | holds | wears | reading |
| --- | --- | --- | --- |
| Agatha | `legacy-tester` unseen | `maintainer-js` | tier 1, own title not overridden |
| Bruno | `legacy-tester` unseen | `maintainer-git` | tier 1, own title not overridden |
| Lorelei | both, unseen | `legacy-active` | tier 2, auto-equipped the rarer |
| Lance | four, all seen | `summit` | control — no grant, no notice |

A throwaway account with one finished and one open calendar run took both titles,
wore the rarer, and had its open run closed as `archived` while the already-finished
one kept its null reason. A second application changed nothing — not the throwaway
account, not the seeded ones.

**NOT verified** — the notice on screen. The data behind it is right (three accounts
carry unannounced grants, two carry none), and the modal and the stamp each have
specs, but nobody has watched it appear once and stay gone. That is the one click
left.

## Follow-ups

- `__root.tsx:82` constructs `new QueryClient()` in the component body. Every
  navigation re-renders it and drops the whole cache, so no query is really cached
  app-wide. Own bean.
- `TitleShelf.ui.tsx` still has no Story, which ADR-010 asks of every Tier 1 file.
  Left to DVTD-0imu, whose work it is.
- The archive credit stays deferred, with its notes above.
- The second title's name is still open. When it settles the edit is
  `title.model.ts`, `CHANGELOG.md` and `docs/wiki.md` §6.6 — the id does not move.

## The archive half landed elsewhere

This bean narrowed to titles and shipped as ADR-111. The storage half — balances
carrying across the cutover, and the 256 KB / 1 MB top-up for this same cohort —
was decided and built on DVTD-yqy4 as ADR-112, reading the `user_titles` rows this
bean writes. Nothing to re-add here.
