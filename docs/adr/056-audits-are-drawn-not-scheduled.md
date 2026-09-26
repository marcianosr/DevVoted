# ADR-056: Audits are drawn from pools, not scheduled per gate

## Status

Accepted — 2026-09-04 (Marciano, DVTD-qfi1). Supersedes [ADR-038](038-the-audit-roster.md) Decision 2's schedule table and narrows [ADR-035](035-gates-are-auditors.md) Decision 4's "fixed thematic rule a gate carries". ADR-038's count curve, its Decision 3 mechanics and its derived-never-stored principle for offline picks all survive unchanged.

**Amended by [ADR-099](099-audits-are-fired-by-rivals.md)** (2026-09-22): Decisions 1, 2 and 4 are superseded — nothing is drawn any more, the count is a capacity and every audit is one a rival fired. What is live here is Decision 3 (the family rule and deny pair), Decision 5 (rank order) and Decision 6 (canonical ids), which now govern what a rival's audit may lock beside.

**Pool membership has moved on.** Decision 4's table below is the membership as drawn in September 2026 and is kept as the record of this decision, not as the live roster. [ADR-058](058-451-redacts-the-answers-and-sells-them-back.md) added 451 to pools A and C, and [ADR-092](092-207-multi-status-hides-the-answer-type.md) added 207 to the same two. `auditSchedule.model.ts` is the source of truth; `docs/wiki.md` §2.8 tracks it.

## Context

`GATE_AUDITS` was an object literal, so gate 7 was always the mirror and gate 9 always the leak. Once a player had seen gate 9 they had seen every gate 9 there would ever be, and the roster's fifteen rules were spent on a seventeen-slot schedule that repeated three of them rather than on combinations.

## Decision 1: the count stays, the identity is drawn

Superseded by [ADR-099](099-audits-are-fired-by-rivals.md) Decisions 1 and 2: nothing is dealt, the curve is the gate's capacity for rivals' incidents.

## Decision 2: the seed is the date

Superseded by [ADR-099](099-audits-are-fired-by-rivals.md): the gauntlet is personal, filled by what rivals fired. `RunState.auditSchedule` is still the one funnel; it starts empty and locks gate by gate.

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

Superseded by [ADR-099](099-audits-are-fired-by-rivals.md) Decision 2: the pools survive as `AUDIT_TIERS`, the payload a rival's shot is drawn from (A at gates 3–7, B at 8–10, C at 11–12, with 410 unpinned and in pool C). Nothing is drawn per gate any more, so band-local uniqueness and `UNIQUE_WITHIN` are gone.

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
