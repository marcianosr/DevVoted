# ADR-138: The gate draws its audits, and a rival buys one to replace them

## Status

Accepted — 2026-09-28 (Marciano, DVTD-rqg8). Supersedes
[ADR-099](099-audits-are-fired-by-rivals.md) Decisions 1 and 3, amends its
Decisions 2, 4 and 5, and amends [ADR-105](105-you-fire-only-from-a-gate-that-can-be-fired-at.md)
Decision 2. Reinstates [ADR-056](056-audits-are-drawn-not-scheduled.md)
Decision 2, the date-seeded draw ADR-099 removed.

Built the same day. `gateAuditsFor` in `auditSchedule.model.ts` is the draw and
the replacement in one function; `heldAudit.model.ts` is the desk; the fire path
and the queue are unchanged.

## Context

ADR-099 made every audit a rival's doing, and earned the shot by clearing a gate
HEALTHY or PERFECT. Three things were wrong with that, and a playtest made all
three visible.

The reward was backwards. A HEALTHY clear already pays the full gate payout,
keeps the streak and advances safely. Handing it a weapon on top gives the
strongest climbers the most ammunition, which they then aim at the leaders they
are chasing. Mario Kart hands the blue shell to the player in last place, not
the player in first.

A quiet day was a mechanically empty day. ADR-099 accepted that with eyes open,
and the consequence was worse than expected: at current player counts most gates
carried nothing, so the 1/2/3 curve described a difficulty that never arrived.

Difficulty became socially random rather than authored. A popular player met a
punishing climb and an unknown one met none, for reasons that had nothing to do
with how the gate was designed.

## Decision

### 1. A gate draws its own audits again, seeded on the date

Every gate from `FIRST_AUDITED_GATE` up draws `auditCapacityFor(gate)` audits
from its tier's pool, seeded on the date and the gate number. Everyone climbing
today at gate 6 meets the same gauntlet, so a posted coverage is comparable
again ([ADR-009](009-session-run-cadence-daily-seeded-shared-run.md)). ADR-099's
"no floor" is gone; its count curve is a dealt count once more, and also still a
ceiling.

Gates 3 and 12 stay unauthored. ADR-099 removed the 402 introduction and the
Champion's trio for reasons this ADR does not touch.

### 2. A rival's incident replaces a drawn audit, never adds to one

The gate's audit list is the locked incidents, then the draw filling whatever
room is left:

```ts
rankAudits([...incidents, ...drawPayloads(pool, incidents, seed, capacity - incidents.length)])
```

`drawPayloads` already excludes the ids it is handed **and their families**, so
displacement, the family rule and the deny pair are one call. A gate with
capacity 1 that takes an incident draws nothing; capacity 2 keeps one draw.

Rivalry therefore changes **which** problem you face, never how many rules are
piled on you, and the readable limit never moves.

### 3. An incident is bought at the shop's Incident desk, not earned

From gate 3, one shop in `INCIDENT_OFFER_ONE_IN` deals one **revealed** audit.
Buying it costs `INCIDENT_KB`; **Refresh** deals another and doubles its own
price for the rest of that shop (`INCIDENT_REFRESH_COST_KB`, the ladder the
linter and the registry rebuild already use). A run holds one incident; buying
while holding replaces it, and the desk names what would be discarded.

The offer is derived, not stored behind a seed: from the gate, the refresh count
and **the id of the first poll the coming window will ask**. The poll id is what
makes the day matter — seeding on the gate alone would fix the schedule forever,
so the same gates would deal an incident on every run of every day. With it, the
desk opens at different gates each day and is still identical for everyone
standing at that gate, like the rest of the shop (`draftSeed`). Nothing is
stamped onto an action, so there is no seed for a client to pick.

Every incident sent is KB that did not improve your own build. That trade is the
mechanic; a reward for playing well is not.

### 4. A target must be able to draw the audit you carry

ADR-099 Decision 4's list survives whole — not you, live run, last close
**cleared** HEALTHY or PERFECT, at your gate or ahead, room at the gate in
front, not your previous target, and `canFireFrom` (ADR-105) — with one clause
added: the audit you hold must be in the pool of the gate it would land on.

The pools are tiered and `POOL_C` is not a superset of `POOL_A`, so without that
clause a 404 bought at gate 3 could replace a gate-11 draw and make the
Champion's gate *easier*. A cheap audit simply has a shorter reach, and that is
a real cost of buying early.

The cap of three offered rivals is gone: you paid for the shot, so every
eligible rival is a target.

### 5. You buy in the shop and file from the community board

The desk sells and holds; the climber card on the climb map files. The card
already shows the rival's open build, gate and standing
([ADR-101](101-builds-are-open.md)), so inspecting a build and choosing a target
are the same gesture. Prep keeps the inbound **Audits** panel, which still names
each audit's sender; it loses the outbound half, amending ADR-105 Decision 2 to
one panel.

The wire payload for a filing is now `{ targetRunId }` alone. The server reads
the audit off the run, so a client can no longer name one at all.

## Consequences

- **A solo climb meets the full curve again.** The gauntlet is authored; the
  rival changes one rule of it.
- **`RunState` loses `offeredAudit`, `auditHandedAtGate` and
  `repackagedThisShop`, and gains `incidentOffer` and `incidentRefreshes`.**
  `HeldAudit` is `{ auditId }`: a bought audit is revealed, so the sealed /
  open / keep machinery of DVTD-406l is deleted rather than reworked. It had
  never been dispatched by any screen.
- **A legacy snapshot keeps a held audit only if it had settled on a payload.**
  An unopened sealed audit had no identity to carry forward, and inventing one
  would hand a player an incident they never chose.
- Surviving an incident still pays `INCIDENT_SURVIVAL_KB`; a drawn audit pays
  nothing for being survived, because the gate payout already covers it.
- The debrief stops chipping `audit earned`. A clear is paid in KB.
- `withLockedGate` became `withGateAudits` and takes the date, so
  `settleIncidents` takes it too. It is still the one writer of a gate's audits,
  still inside the target's own transaction, and a retry still does not redraw.

## Rejected

- **Keeping the earned attack alongside the purchase.** It is the rubber band
  pointing the wrong way; adding a shop next to it would not fix that.
- **A standalone discard press.** Buying already replaces what you hold, so
  discarding alone costs nothing and gains nothing — a press with no decision
  behind it.
- **Letting Refresh conjure an offer in a shop that dealt none.** The find is
  the point; a shop you can always buy from is a shelf.
- **Naming the exact refusal on an out-of-reach climber.** It would restate the
  eligibility rules on the screen, which ADR-105 Decision 1 built one choke
  point to prevent. The card states that the audit cannot reach them, and the
  desk states the rule.
