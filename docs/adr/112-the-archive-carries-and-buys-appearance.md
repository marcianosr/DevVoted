# ADR-112: The archive carries, and it buys appearance and licences

## Status

Accepted — 2026-09-25 (Marciano, DVTD-yqy4). Names a carve-out to
[ADR-051](051-configs-unlock-on-individual-objectives.md)'s no-backfill line.
Decision 1 amended by [ADR-115](115-services-have-two-scopes.md): the archive
buys run services, not licences.

## Context

`users.archived_storage` has been accruing from real play since DVTD-enj5, and
nothing ever said what it was for. The question sat open long enough that the
bean asking it went stale twice over: a second sink was decided the same week
(now ADR-115), and the balance had already appeared on four screens.

What stayed open is the cutover. Accounts that played through the old theme hold
balances they watched go up, and ADR-051 line 166 says "no grandfathering and no
historical backfill: the game is pre-release, nobody has anything yet". Somebody
does.

Three places in shipped text also use the word *archive* to mean the storage a
run is holding, including one that tells the player the archive does not carry.

## Decision 1: the archive is the account's one persistent wallet

It buys **appearance** — borders, 256 KB to 32 MB in `border.model.ts` — and,
since ADR-115, **run services**, once per run and before it. It never buys a
config (ADR-050 D4, ADR-051 D1) and never buys width (ADR-082). The "never buys
power" line and the licence half are dead: ADR-115.

## Decision 2: balances carry at face value

ADR-051's line is not overruled, because it was never about this. That line
refuses backfilling **achievement** — writing a grant row for an objective nobody
was measured against, which invents a thing the player did not do.

Storage is the opposite case. It was banked by real play, under a rule that
already said it persists, and the player watched the number rise on the profile.
Carrying it invents nothing; deleting it would take something that was earned.

So: no scaling, no cap, no reset. The column is left alone at the cutover.

## Decision 3: the legacy top-up is flat per tier, and reads the title ledger

Accounts in ADR-111's cohort are credited once, on top of what they hold:

| tier | holds | credit |
| --- | --- | --- |
| played the calendar game | `title-legacy-tester` | 256 KB |
| caught mid-climb | `title-legacy-active` | 1 MB |

256 KB is the cheapest border, so tier 1 is one thing the player can actually go
and buy rather than a number that moves a bar. Tier 2 **supersedes** rather than
stacks — it is a subset of tier 1, so both rows are present and the grant
collapses to the larger.

**The cohort is read from `user_titles`, never re-derived from `runs`.** ADR-111's
migration ends by closing every active calendar run, so
`mode = 'calendar' AND status = 'active'` matches nobody from the moment that file
has run. Any later migration re-deriving tier 2 that way would report success and
pay nobody. The title rows are the durable record — ADR-109's ledger, doing the
job it exists for.

Idempotence is a `legacy_bonus_bytes` column on `users`: null means unpaid, and
the credit and the marker are written in one statement, so they cannot drift.

## Decision 4: nothing inside a run spends the archive

The peel settles from **run storage**. The gate-hold screen's bribe already reads
`balanceBeforeKb + payout − bill` and only its label said otherwise.

This keeps ADR-082 whole: if the archive could settle a peel, an account with a
long history would buy its way past a gate that a new account has to answer, which
is progression bought outside the run trading against the run — the thing ADR-029
refused. A run service is bought before the run, so this holds (ADR-115).

## Consequences

- The wallet boundary is now one sentence: **appearance and run services, out of
  the run** (ADR-115). The borders and the run services are the whole list, and a
  future sink has a rule to argue against.
- `legacy_bonus_bytes` is a one-off column that outlives its migration on purpose:
  it is the record of what the account was paid, so the profile can state it later
  without a join.
- Three text sites move off the word *archive* (the bribe label, the run-ending
  detail line, and the peel paragraph in the wiki). The Dex header, which reads
  `8.2 MB archive`, was correct and stays.
- The bribe press remains a `noop`. Renaming it does not wire it, and wiring it is
  a separate decision about whether the peel should be payable in cash at all.
