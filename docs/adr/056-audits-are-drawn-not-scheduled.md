# ADR-056: Audits are drawn from pools, not scheduled per gate

## Status

Accepted — 2026-09-04 (Marciano, DVTD-qfi1). Supersedes [ADR-038](038-the-audit-roster.md) Decision 2's schedule table and narrows [ADR-035](035-gates-are-auditors.md) Decision 4's "fixed thematic rule a gate carries". ADR-038's count curve, its Decision 3 mechanics and its derived-never-stored principle for offline picks all survive unchanged.

## Context

`GATE_AUDITS` was an object literal, so gate 7 was always the mirror and gate 9 always the leak. Once a player had seen gate 9 they had seen every gate 9 there would ever be, and the roster's fifteen rules were spent on a seventeen-slot schedule that repeated three of them rather than on combinations.

## Decision 1: the count stays, the identity is drawn

Gates 0 to 2 stay clean, one audit runs from gate 3, two from gate 8, three from gate 11. That curve is ADR-038's and it does not move; only *which* audits fill the slots at gates 4 to 11 becomes a seeded draw. Gate 3 keeps one fixed introduction (402 Payment Required) and gate 12 keeps its handcrafted Champion combination, so a climb still opens and closes on authored content.

## Decision 2: the seed is the date

Everyone climbing on a given day faces the same gauntlet, which is the same choice ADR-009 made for the poll sequence. A posted result is comparable because the rules were the same for everyone who played that day, and "today was brutal" becomes a shared fact rather than a private one. A same-day restart repeats the audits, exactly as it repeats the polls.

The drawn ids are stored on `RunState.auditSchedule`, not re-derived per read. `RunSnapshot` is `Omit<RunState, "polls">` serialized whole, so this needs no migration, and a stored schedule cannot be rewritten under a player mid-climb while the pools are still being tuned. `scheduleOf` is the one place that falls back to a default, and `auditsOf` is the one funnel every engine read passes through.

A missed gate keeps its audits on the retry for free: `gatesCleared` does not advance on a miss, and the schedule is keyed by gate. What still re-rolls is the *victim* inside an audit, because those picks are seeded on the window's start index (ADR-038 Decision 3), which has moved on.

## Decision 3: compatibility is a family rule, not a case list

Every audit carries a family, and a gate never draws two audits from the same family.

| Family | Members |
| --- | --- |
| `paid-actions` | 402 Payment Required, 429 Too Many Requests, 403 Forbidden |
| `offline-config` | 424 Failed Dependency, 502 Bad Gateway, 503 Service Unavailable, 409 Conflict, 426 Upgrade Required |
| `storage-burn` | 507 Insufficient Storage, 413 Payload Too Large |
| `poll-reading` | 300 Multiple Choices, 404 Not Found |
| `shop` | 405 Method Not Allowed |
| `clock` | 408 Request Timeout |
| `stake` | 410 Gone |

The three paid-action rules are one axis at three intensities, so stacking them is arithmetic on a number that no longer matters. The five offline rules are already one mechanism with five pickers (ADR-038 Decision 3), and two of them on a narrow build can empty it. The family rule forbids both without naming a single pair.

One pair is denied on top of families: **300 Multiple Choices never draws with 408 Request Timeout.** A timed-out answer already short-circuits the mirror, so pairing them lets the clock quietly void the audit that was supposed to be the challenge.

**ADR-038's "Read-only sits only on odd gates" is dropped.** Its reason was that storage rungs unlocked on even gates (ADR-030), and gate-staged rungs no longer exist: slots are bought with KB (`SLOT_PRICES_KB`) and storage is a plan tier. 405 is now eligible at any drawn gate.

## Decision 4: three pools, staged by what a rule can honestly mean

| Gate(s) | Draw | Pool |
| --- | --- | --- |
| 3 | fixed | 402 |
| 4 to 7 | 1 each, distinct in band | **A (6)**: 404, 405, 424, 429, 502, 507 |
| 8 to 10 | 2 each, distinct in band | **B (13)**: pool A + 402, 409, 426, 503, 300, 408, 413 |
| 11 | 410 pinned + 2 drawn | **C (9)**: 403, 300, 408, 409, 426, 503, 507, 413, 502 |
| 12 | fixed, handcrafted | 408, 410, 413 |

409 Conflict and 426 Upgrade Required are pool B and later because both pick by config level, and at gate 4 nothing is upgraded: they would roll among ties while their copy claims to punish having a favourite. 413 Payload Too Large is inert below twelve slots, so it starts where builds get that wide. 403 Forbidden is pool C only, being the Elite-tier version of 402 and 429. 402 itself is absent from pool A so the first five audited gates always teach five distinct rules.

410 Gone stays pinned to gate 11 so Elite's peel share remains a number the wiki can state rather than a per-run variable.

Uniqueness is **band-local**, and that is a roster limit rather than a preference. A run draws twelve times; the roster holds fifteen, of which 410 is pinned and 402 is the introduction, leaving thirteen candidates. Run-wide uniqueness would put twelve of thirteen audits into every climb, which is the same cast daily in different seating, and it would strand gate 11, whose pool has a single exclusive member. `UNIQUE_WITHIN` names the scope in one place: authoring roughly six more audits and flipping it to `"run"` is the second step.

## Decision 5: a drawn gate is ordered by roster rank

Order is load-bearing, because the receipt reads top down and Volkswagen CI suppresses the first entry. A drawn gate sorts by a fixed `AUDIT_RANK`, so a player learns which of their audits the defeat device will cancel instead of rediscovering it every run. 410 Gone takes the top rank, which keeps ADR-037's "at Elite it cancels the deepened peel". Gate 12 keeps its authored array verbatim, which keeps ADR-038's "at Champion it stops the leak and leaves the strip in force".

## Decision 6: ids are canonical, and the Dex teaches pools

`timeout-3`/`timeout-5` and `strip-10`/`strip-15` baked a dial into the id, which is what made a drawn audit unnameable. The dial is now a function of the gate (`timeout`: 3 polls at 30s below gate 10, 3 at 25s at 10 and 11, 5 at 20s at 12; `strip`: +0.10 at 11, +0.15 at 12), so there are fifteen ids for fifteen rules and `auditAt(id, gate)` builds the dialled audit.

The Dex can no longer say "gate 5 is 404". Instead:

- **Gates tab** names the audits a gate is *certain* to carry and states a drawn gate's shape as a count (`draws 2 of 13`). A count rather than names, because pool B's thirteen rules repeated across three rows would bury the ladder's own figures.
- **Audits tab** is one row per rule with every gate it can reach, which is where the pools are actually published, and which is what answers the "visible odds, no hidden dice" requirement in DVTD-aqkc: the unpredictability is *between* runs, and within one the stake receipt still names every audit before the player walks in.

## Consequences

- The Audits tab's `beaten X of Y` record now counts only gates where an audit is certain, so a drawn audit reports 0 and the panel prints no record at all. Nothing stores what a draw dealt; a truthful per-audit tally needs DVTD-gvc9's persistence. A missing record beats a fabricated one.
- An audit's Dex tier is now band-shaped: reaching gate 4 reveals all six pool-A rules at once, because any of them may be on that gate's receipt.
- Pool A is the thin end at six rules over four gates (fifteen distinct sets). Authoring genuinely early audits is the first tuning lever, and DVTD-6moy collects ideas.
- Endless gates past 12 (DVTD-yzyg) now have a pool to draw from, which is what that idea was missing. Not built here.
- DVTD-7atd shrinks but does not close: the kit keeps its own `AuditId` union because a runtime `src/ui/` file may not import `modules/*/domain` under dependency-cruiser. The two unions are now identical strings and `toAuditId`'s suffix-stripping regex is dead.
- Specs that pinned an audit to a gate number now name the audit instead, via `audited(state, gate, ...ids)` in `run.factory.ts`. The schedule's own invariants are swept over 500 seeds rather than asserted against a table.
