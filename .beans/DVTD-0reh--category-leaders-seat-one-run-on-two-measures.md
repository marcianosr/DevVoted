---
# DVTD-0reh
title: Category leaders seat one run, on two measures
status: completed
type: feature
priority: normal
created_at: 2026-09-27T18:23:26Z
updated_at: 2026-09-27T18:49:40Z
---

**What:** The community board seats two sets of category leaders, one for the longest streak inside a single run and one for the most correct answers inside a single run.

**Why:** A record folded out of every answer ever given rewards longevity, not a run, and a roguelite's unit of achievement is one run.

## Done when

- [x] Both boards seat twelve categories each, and a figure counts only answers given inside one run
- [x] A seat states which measure won it, and an open seat states the figure that claims it
- [x] The two boards stack on a phone and sit side by side on a wide screen, with every figure on its row
- [x] The poll screen still states one leader on one line, the streak one
- [x] A freshly seeded database shows held seats on both boards, with different holders and different figures
- [x] The wiki and the changelog state the new scope, and the decision is written down

## Notes

Settled with Marciano before starting:

- Scope is the best single run, all time, across finished and active runs alike. Not today's live runs.
- A wrong answer breaks a streak. Clearing a gate does not, even though the run's own overall streak resets there. The board counts a per-category streak and the engine counts no such thing, so there is no engine number to mirror.
- The poll screen keeps one figure. Two measures make the one-line argument stronger, not weaker: they sit in different registers and would be held by two different people.
- The correct-answers floor sits above the streak floor, because a correct count is always at least as large as a streak and two equal floors would print two claim lines that read alike.
- Records are derived from the answer ledger, not from the orphaned per-run coverage table. Reviving that table means a backfill that is the derived query anyway, and every older run would read empty.

Known consequence, and it is intended: every answer given outside a run stops counting, which is the whole calendar-era ledger. Figures drop and some seats open.

Known limit: the seeded question pool holds eight polls per category, so seeded figures top out at eight where the fixtures show twenty-one. Growing the pool is separate work.

Plan: `~/.claude-work/plans/category-leaders-wobbly-kitten.md`

## Summary of Changes

ADR-131. The board is two boards now, both bounded to a single run.

**The read is still one statement.** Partitioned by `(user_id, run_id, category_code)`, `max(island)` is the best streak and `sum(island)` is the correct count, because every correct answer falls in exactly one island. The second board rides the same window scan; nothing was added to pay for it.

**Two traps, both real.** `row_number()` is a bigint, so the driver hands a rank back as a string; comparing it strictly against `1` in TypeScript silently emptied both boards. There is a regression test that fails without the coercion. Keeping the rank honestly typed as a string then broke the SQL-side comparison, which is now a raw predicate rather than `eq`.

**The seed writes synthetic runs.** Four state-less finished runs per account, spanning yesterday back to 56 days ago, so the last answer is never dated today and the day-lock read cannot mistake seeded history for the current run. State-less is deliberate: run history, the climb map and the fallen lane all inner-join `run_states`, so these runs exist only to give answers a run id. Climber answers for today now carry their live run id too.

**A finding worth acting on separately.** The two boards read almost the same. Across three seed tunings, only 1 of 12 categories ever showed a different figure on the two boards, and 3 of 12 a different holder. The cause is structural, not a seed artifact: when a run answers few polls in a subject, a player who does well aces the lot, so their best streak equals their correct count and they top both boards with the same number. A real run answers roughly five polls per category, so the same convergence applies in play. The correct board is built and correct; whether it earns its place is a design question the seeded data now poses plainly.

**Known limit:** the seed pool holds eight polls per category, so seeded figures land between six and eight where the fixtures show twenty-one. Growing the pool is separate work.

Verified: 4367 tests pass across 225 files, typecheck clean, oxlint clean, no dependency violations, wiki in sync. Both boards read twelve of twelve seated off a fresh `db:refresh`, with six distinct holders.
