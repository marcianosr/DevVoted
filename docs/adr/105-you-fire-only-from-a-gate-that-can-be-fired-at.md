# ADR-105: You may only fire from a gate that can be fired at

## Status

Accepted — 2026-09-24 (Marciano, DVTD-k0ko). Adds one clause to
[ADR-099](099-audits-are-fired-by-rivals.md) Decision 4's eligibility list and
leaves the rest of it standing. Re-affirms ADR-099's refusal of a free payload
pick, which a redesign mock had reopened.

Built the same day. `canFireFrom` in `incident.model.ts` is the clause;
`AUDITS_FROM_GATE`, derived from `AUDIT_TIERS`, is the number.

## Context

ADR-099 Decision 2 gave gates 0–2 a capacity of zero, so nothing can land on
them. The eligibility rules in Decision 4 are all about the *target*: their run
is live, their last close cleared strong, they stand at your gate or ahead, the
gate after theirs has room. Nothing asked where the attacker stood.

The result was an exchange that only ran one way at the bottom of the climb. A
player standing at gate 0 who cleared it HEALTHY holds an attack and is offered
the leaders, because leaders are by definition at their gate or ahead. Their own
next gate is gate 1, capacity zero, so no rival can reach them. Three gates of
free shots.

Prep also drew the two panels as though the mechanic simply had no takers there:
"none this gate" beside a rival list, which reads as a quiet day rather than as
a shut door.

## Decision

### 1. An attacker must stand in a gate that could carry an audit

`canFireFrom(attacker)` is `auditCapacityFor(attacker.gatesCleared) > 0`, and
`eligibleRivals` returns nothing below it. Both the offer read and the fire
re-derive offers through that one function, so the server enforces the floor
rather than the screen hiding the press.

With the current tiers that opens the exchange at **gate 3**. The number is
derived (`AUDITS_FROM_GATE = Math.min(...AUDIT_TIERS.flatMap(t => t.gates))`),
never written down twice: retuning the tiers moves the floor with them.

This is deliberately stricter than "the gate you could be aimed at", which would
open at gate 2 — an attack aims at the *next* gate, so a player at gate 2 is
already targetable. Standing in range of one is the readable version of the
rule, and one gate of grace at the very start of a climb costs nothing.

### 2. Both prep panels draw shut, naming the gate that opens them

Below the floor, `Audits` and `Your audit` keep their headers, wear a badge
reading `gate 3 · Thunder`, and state the rule in place of their rows. Neither
carries the note promising what a fired audit does, because none can be fired
(the rule [ADR-082](082-build-space-is-rented-by-the-gate.md)'s locked arm
settled: prose promising a next step goes with the press).

### 3. The payload is still drawn, not picked

Restated because a redesign proposed a list of the target gate's pool with a
press each. ADR-099's reasoning is unchanged and now rests on a rule rather than
a premise: [ADR-101](101-builds-are-open.md) makes the target's build readable,
so a chosen payload would be a scalpel. What the redesign *does* show is the
payload the server already rolled, its effect, and — where the build alone names
one — the config it would take out.

## Consequences

- An early climber's armed attack sits unspent until gate 3. It does not expire
  (ADR-099 Decision 3), so nothing is lost.
- A gate-3 attacker can still be offered a gate-11 leader. The floor is on the
  attacker's own footing, not on the distance between the two.
- Only the level-edge picks (`highest-level`, `lowest-level`) can name a config
  off a `PublicBuild`. The seeded picks need a poll window no rival exposes, and
  a tie at the edge is broken by that same seed, so both stay unnamed rather
  than guessed at.
- `AttackOfferView` carries the target's `userId`, so an audit you received can
  find its sender's row. Answering one is a shortcut that opens that row, never
  a reply mechanic of its own.

## Rejected

- **Opening at gate 2, the first gate you can be aimed at.** Correct to the
  letter and confusing to read: the panel would open a gate before any audit
  could appear on it.
- **Letting the screen hide the press while the server still allowed the fire.**
  The offer read and the fire share `eligibleRivals` precisely so they cannot
  disagree.
- **A free pick of the payload** — see Decision 3 and ADR-099's own Rejected
  list.
