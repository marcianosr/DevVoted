# ADR-038: The audit roster — nine rules, staged by count

## Status

Accepted — 2026-08-17 (Marciano, DVTD-60he, extended the same day by DVTD-lhao with Flaky Build, Rolling Outage, Deprecated and the Mirror rewrite). Fills out ADR-035 Decision 4, which shipped four audits and left gates 3–6, 8 and 10 as open content slots. One reversal: ADR-035's score-inverting Mirror is replaced by a poll-inverting one (Decision 4 below).

## Context

Marciano's list arrived as "debuffs" — Dependency Outage, Cost Overrun, Feature Freeze, Read-only, Memory Leak, Mirror, Timeout, then Flaky Build, Rolling Outage and Deprecated — with one instruction attached: they should escalate as the run gets deeper. Two already existed as audits (the Mirror at gate 7, the Burn at 9), which made the question a vocabulary one before it was a mechanical one.

## Decision 1: they are audits, not a second concept

One word. `Audit` keeps its name, the receipt keeps its "Audit" section, and every new rule is a roster entry. A parallel "debuff" system would have meant two types, two sections and a permanent question about which one a new rule belongs to. The Burn is renamed **Memory Leak** (16/32KB, Marciano's numbers) because it names a real thing where "the Burn" named a vibe.

## Decision 2: the count is the escalation

> ⚠ **The count curve survives; the table below is superseded by [ADR-056](056-audits-are-drawn-not-scheduled.md)**
> (2026-09-04): gates 4–11 draw their audits from staged pools, seeded on the date.
> Gate 3 and gate 12 stay fixed as written. A drawn gate's order comes from a roster
> rank rather than from an authored array, which keeps the Volkswagen CI point below.

Gates 0–2 stay clean for onboarding, one audit runs from gate 3, two from gate 8, three from gate 11. The steps land near the peel curve's (ADR-037), so depth reads as one escalation rather than two.

| Gate | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Audits | Cost Overrun | Outage | Read-only | Freeze | Mirror | Timeout + Flaky | Leak + Rolling | Breaking Change + Timeout | Strip + Mirror + Flaky | Leak + Strip + Timeout |

Order inside a gate matters: the receipt reads top down, and Volkswagen CI reports the *first* audit as passing, so the entry a player would most want suppressed leads where that choice is the point.

## Decision 3: what each rule does to the engine

| Audit | Field | Rule |
| --- | --- | --- |
| Cost Overrun | `feeMultiplier` | Lint and peek fees ×2. Stacked overruns multiply. |
| Feature Freeze | `freezesManualEffects` | The paid actions stop existing — no button to explain itself, because the receipt already did. |
| Read-only | `closesShop` | The shop *before* this gate refuses every write: draft, upgrade, rebuild, lock, extend, plan, git tag, uninstall. Dropping still works: it belongs to the gate door, not the till. |
| Dependency Outage | `disablesConfig: "one-per-attempt"` | One installed config is offline for the attempt. |
| Flaky Build | `disablesConfig: "random-per-poll"` | A fresh roll every poll; it can flake the same config twice. |
| Rolling Outage | `disablesConfig: "rotating-per-poll"` | Steps through the pipeline, a different config down each poll. |
| Breaking Change | `disablesConfig: "highest-level"` | The config you upgraded most, all attempt. No roll — it punishes having a favourite. |
| Timeout | `timedPolls` | The window's first N polls carry a clock; an answer over it scores as a miss. |
| Memory Leak | `burnKb` | −16KB a poll, −32KB on a miss (was the Burn). |

**Read-only sits only on odd gates.** The storage rungs unlock on even ones (ADR-030), and shutting the shop on the gate a rung arrives at would unlock something the player cannot buy until the gate after — which reads as a bug, not a rule.

> ⚠ **Dropped by [ADR-056](056-audits-are-drawn-not-scheduled.md)** (2026-09-04): gate-staged
> rungs no longer exist, so the parity rule has no reason left. 405 is eligible at any drawn gate.

**The four offline audits are one mechanism with four pickers.** They differ only in which config they choose and how long it stays down, so `offlineConfigsFor` folds them together and `OfflinePick` names the four flavours. Every pick is **derived, never stored**: the seeds are the window's own start index and the poll's place in it, so a pick is stable for exactly as long as it should last, different on the next attempt, and identical after a reload — no migration, and no chance of drifting from a rehydrated window. All four sort by config id first, so they answer to what is installed rather than to purchase order. Three of them are outright random rolls; Deprecated is the one that is not — it takes the config levelled furthest, and rolls only among the ones tied for it. Ties are the common case, since most builds have nothing upgraded, and taking "the first" there would quietly always mean the same config. The defeat device's suppression is decided before all of it: the fraud was filed at the door, so a config going offline inside the window cannot un-suppress what the receipt showed as passing.

**A timed-out answer is a miss whatever was picked**, and it short-circuits the mirror rather than feeding it — timing out must never be the way to score. Nothing auto-submits: running out means the answer will not count, which the clock says in place. `AnsweredPoll.timedOut` keeps the review honest, since the outcome beside it now reads "wrong" for an answer that was right.

## Decision 4: the Mirror flips the poll, not the score

ADR-035's mirror inverted the *share*: a wrong answer scored as if right. That made "pick any wrong option" the whole skill on a single-answer poll, and because a mirrored answer forfeited its streak, the gate needed a 0.5 demand discount to stay clearable. It is replaced by a mirror that rewrites the **question**: every option's correctness flips, so the poll asks for the incorrect options and asks for *all* of them. A four-option single-answer poll becomes a three-option select-all, which takes exactly the same knowledge and rather more precision.

Everything downstream then grades normally, which is the point: outcome, partial credit, streaks and the difficulty bonus all work unchanged, `answeredThisGate.correct` holds the mirrored expectation so the reveal and the review agree with the score, and the gate charges its **full demand** — `scoreShare` and `demandFactor` are gone from the mirror. `.length`'s reveal counts the wrong options at a mirrored gate, since those are the picks the window will actually ask for; the budget is computed when a window opens, so `freshWindow` now takes the gate it belongs to.

A poll whose options are all correct is left unmirrored — there would be nothing to pick, and an unanswerable poll is a soft-lock rather than a debuff.

## Decision 5: an offline config says so, and stops selling

The pipeline rail marks it: the row dims, its effect strikes through, and an `offline` badge sits on the chip. It keeps its slot — the build is unchanged, the effect just does nothing — so removing the row would misreport the pipeline. The row also **opens itself**, because a struck-out promise folded away communicates nothing, and its paid action disappears, since a switched-off Telemetry would otherwise charge a peek fee for data it can no longer read. `liveConfigsOf` is the one place that subtracts the offline set, and `lintApplies`/`peekApplies` read it, so a hidden button and a refusing reducer can never disagree.

Only the answering screen shows this. The shop and prep run *before* the gate, where the roll has not been reached yet — naming a casualty there would be a spoiler, so those screens name the audit and leave the victim to the gate. For the same reason the stake receipt's per-answer preview still prices the whole build: Flaky Build and Rolling Outage move every poll, so no pre-gate number could be honest about them.

## Decision 6: a mirrored response records which question was asked

`polls_responses.mirrored` (migration `20260818090000_add_mirrored_response.sql`). The picks alone cannot say — a mirrored answer looks exactly like a wrong one — and the two readers of session answers need opposite things from that fact:

- **The community split excludes mirrored rows.** It sells what the room thinks the answer *is*, and a mirrored voter was asked for the incorrect options, so their picks would invert the very signal being priced. A smaller honest sample beats a larger misleading one; Telemetry's L2 upgrade already exists to show that sample size.
- **The run's community board counts them, graded against the mirrored expectation.** Naming every wrong option proves the same knowledge as naming the right one, so it counts as correct and mixes freely with plain answers. That is what makes the two treatments consistent rather than arbitrary: **the board counts knowledge, the split reports opinion.** Knowledge composes across mirrored and plain answers; opinion does not.

Per-option `isRight` stays the poll's own truth on the board. The mirror changes what was asked of one player, never what is true, and the board is read by players at different gates.

## Consequences

- The clock is measured client-side (`usePollClock` owns both the countdown and the submitted `elapsedMs`, so the display can never disagree with what the gate grades). A determined player can lie to it; the same was already true of the "fastest answer" standout, and the stake is a poll rather than a leaderboard.
- Playtest-first numbers, all in `audit.model.ts`: the ×2 fee, 16/32KB leak, and the clocks (30s at gate 8, 25s at 10, 20s at 12 — the loudest guesses in the roster, since a rhyming question with a code block is not a 20-second read).
- A gate's difficulty now comes from two directions at once. The demand rows were priced when a miss was free (ADR-035) and have not moved since; if the middle gates read as punishing, they are the first thing to loosen.
- Gates 4–6, 8 and 10 are no longer open slots. DVTD-6moy keeps collecting ideas for a second pass.
- The legacy calendar-loop stats (`communityStats.queries.ts`) filter `mode = 'calendar'`, so no session answer — mirrored or not — has ever reached the daily loop's awards or correct-rates. Nothing to fix there, and the `mirrored` default of `false` keeps it that way.
- `CorrectnessCheck` gained a third parameter so the standouts module can grade a mirrored answer without learning what a poll record looks like.
