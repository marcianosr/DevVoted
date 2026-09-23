# ADR-099: Audits are fired by rivals, and the gate's count is its capacity

## Status

Accepted — 2026-09-22 (Marciano, DVTD-87ql). Supersedes
[ADR-056](056-audits-are-drawn-not-scheduled.md) Decisions 1, 2 and 4 (the
count curve as a dealt count, the date seed, the authored gates and pinned
410), and [ADR-038](038-the-audit-roster.md) Decision 2's "the count is the
escalation". ADR-056's family rule, deny pair, rank order and canonical ids all
survive and now govern what a rival's audit may land beside. Narrows
[ADR-035](035-gates-are-auditors.md) Decision 4 again: a gate has no
personality of its own; it carries what the community did to your climb.

Built the same day. `AUDIT_TIERS` in `auditSchedule.model.ts` owns the
capacity and the pools; `incident.model.ts` owns eligibility, offers and the
lock; `incidentSettlement.service.ts` is the one writer of a gate's audits;
`audit_incidents` is the queue.

## Context

Under ADR-056 every gate from 3 dealt a fixed number of audits, drawn from a
pool seeded on the date, so everyone climbing on a day faced the same gauntlet.
Two things had moved since. The coverage bands (ADR-073, ADR-094) became a
dependable difficulty curve in their own right, so the audits stopped being the
only escalation. And the roster's fifteen rules were still spent on a
seventeen-slot schedule: a player who had seen gate 9 had seen every gate 9.

The bean's framing was Mario Kart. The leading racer might dodge every blue
shell or get mugged on the final straight, and that variance is what makes a
race a shared story rather than a time trial. An audit becomes a shell: something
a rival did to your journey, not something the calendar dealt.

## Decision

### 1. No gate deals an audit. A rival fires one.

Every audit a gate carries from gate 3 upward is one a rival aimed at it. A gate
nobody attacked is clean. There is **no floor**: the date-seeded draw is gone,
and with it the two authored gates. 402 stops being the guaranteed introduction
at gate 3 and the Champion's handcrafted trio goes; both gates follow the same
rule as every other.

`RunState.auditSchedule` stays the one funnel. It starts empty and is filled
gate by gate as incidents lock (Decision 5), so every engine read, the stake
receipt and the Dex work unchanged.

### 2. The ADR-038 count curve is the capacity

Gates 0–2 take nothing, gates 3–7 take one incident, 8–10 two, 11–12 three.
That is ADR-038's curve read as a ceiling rather than a dealt count. The pools
survive as **what a rival's payload is drawn from**: gates 3–7 from pool A, 8–10
from pool B, 11–12 from pool C, with 410 Gone joining pool C now that nothing
pins it to gate 11. `AUDIT_TIERS` states all three.

### 3. A HEALTHY or PERFECT clear arms one attack, held for the run

A gate that **clears** in HEALTHY arms a single-payload attack; PERFECT arms a
choice between two rolled payloads. OK arms nothing: a thin clear is not
ammunition. A run holds **at most one** attack, it lasts until fired or the run
ends, and a later clear can only upgrade HEALTHY to PERFECT — never stack a
second, never downgrade. Strong players would otherwise stockpile shells.

### 4. Who may be aimed at

A rival is offered when all of these hold: they are not you; their run is live;
their **last close cleared** in HEALTHY or PERFECT; they stand at your gate or
ahead; the gate after the one they are in still has room; and they are not who
you fired at last. OK and SHAKY players are protected because they are already
struggling, and a floor-held HEALTHY meter is a struggling player too. Three
rivals are offered, leaders first with ties broken by a seeded shuffle, and the
deal is fixed for the attacker's run and day so a refresh never re-rolls it.

The attacker does **not** pick the audit. The server draws the payload from the
target gate's pool, excluding families already queued for that gate, seeded on
attacker, target, gate and date. Builds are open, and a free pick would be too
surgical.

### 5. Delivery: the gate in front locks when the one before it clears

An attack aims at the target's **next** gate, never the one they are in. It sits
`queued` until the target clears their current gate; at that clear, the
settlement reads the queue for the gate now in front, admits incidents
first-come-first-served up to the gate's capacity and the family and deny
rules, ranks them by `AUDIT_RANK` so the defeat device stays predictable, and
writes them into `auditSchedule` **before the snapshot persists**. Anything that
did not fit carries to the following gate, or lapses past the summit.

This is what keeps ADR-042 pillar 2: the slots lock before the Registry opens,
so the stake receipt names every audit, and its sender, before the player walks
in. Nothing sent after the lock can reach that gate.

The lock-time capacity is the law. The offer screen checks capacity as a
courtesy, but no cross-row lock is taken when firing: two attackers filling a
last slot at once would otherwise deadlock on each other's `run_states` rows,
and the overflow simply carries forward.

### 6. Surviving pays; the attacker never profits from a death

Each incident a cleared gate carried adds `INCIDENT_SURVIVAL_KB` (32 KB) to the
clear, itemised on the debrief. A run that ends under an incident fails it;
nothing is credited to whoever fired it. Paying for a rival's death would turn
rivalry into farming (ADR-042 anti-pillar 4), so the attacker's only gain is
that a leader may be slowed.

### 7. Attribution and the public log

An incident names its sender on the stake receipt, on prep and on the debrief
(the requirement DVTD-mvhv set for any thwart), and every incident filed today
is readable by everyone at `/run/incidents`, with the viewer's own rows ringed.

## Consequences

- **"Everyone faced the same gauntlet" is gone, deliberately.** ADR-009 keeps it
  for the polls; the audits are personal now. A posted result compares coverage,
  not audits.
- **A solo climb meets no audits.** At current player counts that is most climbs.
  This was chosen with eyes open over a drawn-audit floor (see rejected.md): a
  calm day is a real outcome, and a floor would put the date back in charge.
- Live runs migrate gate by gate: the gate in front keeps the schedule it was
  dealt, and each clear overwrites the next gate with locked incidents. No
  snapshot migration.
- The Dex can name no certain audit any more; a gate states its capacity and
  pool. The per-audit faced/beaten tally that ADR-056 could not honestly fill now
  has a true record in `audit_incidents` (DVTD-gvc9's option B, for free).
- The offer read hits every live run's `run_states` row. It runs only while an
  attack is armed, off the blob's scalars plus one JSON path, and is cached for
  five minutes; a stale pick is refused with "that rival has moved on".
- `RunState` gains `attack`, `attackEarnedAtGate`, `lastClose`, `incidents` and
  `incidentSurvivalKb`; `GatePayout` gains `incidentSurvivalKb` and
  `attackEarned`; `applyActionToRun` gains the `settle` seam.
- Standouts for the most-wanted and the survivor, and a run-over tally of
  incidents faced, are left to follow-up beans.

## Rejected

- **A drawn floor under the incidents** (the curve minus one, or the old count
  with attacks replacing draws). Either keeps the date dealing audits, which is
  the thing being removed; the second also gives an attack no teeth.
- **Keeping gates 3 and 12 authored.** The Champion's reliable challenge is its
  90% line, not its audits; and an introduction nobody fires is not one.
- **Attacks that stack or expire.** Stacking arms strong players; expiry punishes
  a player for not visiting prep on the day, which is not a skill.
- **A free pick of the payload.** Open builds make a chosen audit a scalpel.
