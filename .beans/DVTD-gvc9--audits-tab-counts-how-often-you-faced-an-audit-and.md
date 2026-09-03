---
# DVTD-gvc9
title: Audits tab counts how often you faced an audit and beat it
status: draft
type: feature
created_at: 2026-09-03T07:37:21Z
updated_at: 2026-09-03T07:37:21Z
---

The Audits tab shows a per-audit tally on the right of each row. Today that
number is fabricated: `AuditsPanel.ui.tsx` takes `faced: number` and the stories
hand-write 7, 4, 3, 1, 5. The wired Dex (`auditdex.model.ts`) has no count at
all, only a tier of faced / unlocked / unseen derived from whether the gate
carrying the audit has ever been cleared.

Wanted: how many times you have faced each audit, and how many of those you beat.

## Two ways to get the numbers

**A. Derive from run history.** No new table. `auditsForGate(gate)` is
deterministic, so for every run in `run_states` (one row per run, carrying
`gates_cleared`) plus `runs.status`:

- gates `0 .. gates_cleared - 1` were faced and beaten
- gate `gates_cleared` was faced and not beaten, unless the run is `won`
- an `active` run's current gate counts as faced, not beaten

Retroactive over every run the account has ever played, with no migration.
The catch is ADR-035: a missed gate peels a config and re-runs the same gate,
and `gates_cleared` does not record attempts. So "faced" would mean "gates
reached", counting one per run rather than one per attempt, and would undercount
exactly the audits a player struggles against most.

**B. A counter incremented at gate resolution.** Precise, counts retries, needs
a table plus a guarded migration, and starts at zero on ship day: every existing
account reads as never having faced anything.

## Recommendation

A, phrased so it cannot lie. Label the row "beaten 3 of 5", where the figure is
runs, not attempts, and say so in the tab's note. B is the better number but not
worth a migration and a dead history until the Dex is doing more with it.

## Blocked on

`/dex` still runs modern-theme; the terminal `AuditsPanel` is Storybook-only.
Wiring this means either wiring the terminal Dex first or adding the count to the
modern `AuditsView` and porting it over.

- [ ] Decide A or B
- [ ] Domain: counts on `AuditdexEntry`, derived from run history
- [ ] Query: aggregate gates reached and cleared per account
- [ ] Kit: `DexAudit` takes beaten alongside faced; row reads "3 of 5"
- [ ] Note on the Audits tab saying the figure counts runs, not attempts
