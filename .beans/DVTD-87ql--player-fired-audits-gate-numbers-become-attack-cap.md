---
# DVTD-87ql
title: 'Player-fired audits: gate numbers become attack capacity, not a dealt count'
status: completed
type: feature
priority: critical
created_at: 2026-09-22T11:27:07Z
updated_at: 2026-09-22T16:44:49Z
parent: DVTD-h175
blocked_by:
    - DVTD-8f3i
---

The Mario Kart framing changes the verdict: **audits could become entirely
player-fired.**

Coverage bands already provide the dependable difficulty curve. Audits stop being
guaranteed difficulty and become **social chaos**. The gate numbers then define
the **maximum attack capacity**, not the number automatically dealt.

## Maximum incoming audits

| Gate | Max incoming |
| --- | --- |
| 0–2 | 0 |
| 3–7 | 1 |
| 8–10 | 2 |
| 11–12 | 3 |

Unfilled slots stay empty. One player reaches Champion clean; another arrives
carrying three incidents. **That variance is acceptable because it is the
point** — the leading Mario Kart player might dodge every blue shell or get
mugged on the final straight.

The 90% Champion coverage demand remains the reliable final challenge. Audits are
what the community did to your journey.

**To tweak:** the table should also depend on the closing band, not gate alone.
For instance, allow audits on **OK** once at Elite or Champion, where the
protection below is too generous.

## Earning an attack

| Closed at | Attack earned |
| --- | --- |
| OK | none |
| HEALTHY | send one audit |
| PERFECT | send one audit, choosing between **two** randomly rolled payloads |

PERFECT does not send two. Strong players would generate too much ammunition.

## Who can be targeted

Only a player who:

- last closed **HEALTHY or PERFECT**
- is at the **same gate or ahead** of the attacker
- has an audit slot available
- has **not been targeted by that attacker recently**

The Community screen offers **three eligible opponents, weighted toward the
leaders**. That gives Mario Kart rubber-banding without letting anyone
repeatedly bully one friend.

OK and SHAKY players are protected: they are already struggling, and throwing a
shell at twelfth place isn't rivalry, it's paperwork.

## Choosing the audit

Because builds are open, the attacker does **not** freely pick an audit —
counter-picking would be too surgical. Instead:

1. Choose the rival.
2. The server draws an audit from **that rival's gate's** eligible pool.
3. PERFECT lets you choose between two draws.
4. Normal audit-family exclusions still apply.

## Delivery timing

The audit targets the player's **next unlocked gate**. It never interrupts the
one they are in.

1. Rival sends an audit.
2. It enters the target's **incident queue**.
3. When the target clears their current gate, the next gate's audit slots **lock**.
4. Registry opens with the incoming audits **already known**.
5. The player prepares their build against them.
6. Anything sent after the lock waits for the following gate.

This preserves "stakes are known before entering" and stops midnight
speedrunning from dodging attacks.

## Reward for surviving

Each player-fired audit raises the gate reward: perhaps **+16 KB or +32 KB per
survived audit**.

The run summary records **"9 community audits faced · 7 survived."** Possible
Standouts: *most wanted*, *audit magnet*, *survived the stack*.

**The attacker does not profit when somebody fails.** Their only advantage is
that a leader may be slowed. Paying players for causing deaths would turn playful
rivalry into farming weaker accounts.

## Tensions to resolve before building

- **Reverses ADR-056 Decision 2.** The audit seed is currently the date, so
  "everyone climbing today faced the same gauntlet" and a posted result is
  comparable. Player-fired audits make each climb's gauntlet personal. That is
  the deliberate trade, but the ADR has to be amended, not quietly contradicted.
- **The empty-lobby problem.** The first players of a day have no attackers, and
  a quiet day fires nothing. Decide whether that is fine (a calm day is a real
  outcome) or whether a floor of drawn audits backstops it. Related:
  [[checks-never-depend-on-social-data]] — only payouts may read community data,
  never checks. An audit is gate friction rather than a config check, so the
  principle does not forbid this, but the same quorum question applies.
- **ADR-042 pillar 2** ("nothing is hidden that costs you") is satisfied by the
  delivery timing above, since the slots lock before the Registry opens. Any
  later change to that ordering breaks the pillar.
- ADR-038's count curve is reused verbatim as the cap. Confirm it is still right
  as a ceiling, given it was tuned as a guaranteed dealt count.

## Open

- [x] Band-aware cap table — deferred: gate-only capacity ships first (follow-up bean)
- [x] Quiet day: **no floor**. A gate nobody attacked is clean; gates 3 and 12 lose their authored audits too (2026-09-22)
- [x] ADR-099 supersedes ADR-056 D1/D2/D4 and ADR-038 D2 (curve → capacity)
- [x] Survival bonus: `INCIDENT_SURVIVAL_KB = 32`, flat, its own payout line
- [x] Cooldown: not the same user as the attacker's previous incident
- [x] Queue: `audit_incidents` table bound to the target's run; the target sees it on `/run/incidents` (everyone's incidents today)

## Related

DVTD-8zt9 (thwarts), DVTD-t836 (451 Phase 2, the other player-fires-at-the-world
mechanic), DVTD-mvhv (PvP thwarting design brief), DVTD-8f3i (open builds, which
this leans on for target selection).

## Settled 2026-09-22

- One attack at most, lasts the run, a later earning only upgrades HEALTHY → PERFECT.
- Targetable = last close **cleared** healthy/perfect (`RunState.lastClose`).
- Picker lives on the kanto prep screen beside incoming audits; feed at `/run/incidents`.
- Lock-time capacity is the law; overflow carries to the following gate.

## Build slices

- [x] 1 Capacity replaces the draw (domain, Dex, prep bug fix)
- [x] 2 Reducer earns and records (`lastClose`, `attack`, survival KB, `fire-audit`)
- [x] 3 Incident domain (eligibility, offers, payloads, `lockIncidents`)
- [x] 4 Storage + settlement hook
- [x] 5 Firing services, server fns, hooks
- [x] 6 Surfaces (AttackPanel, IncidentsScreen, sender attribution, outcome)
- [x] 7 Docs (ADR-099, wiki, CONTEXT, CHANGELOG)

## Summary of Changes

Built 2026-09-22 as ADR-099.

- **Domain.** `drawAuditSchedule` and the date seed are gone; `AUDIT_TIERS` states capacity (0/1/2/3) and pool per gate; `drawPayloads`, `eligibleFor`, `rankAudits` are the reusable pieces. New `run/domain/attack.model.ts` (`armAttack`, `payloadCountFor`, `fireAudit`) and `incident/domain/incident.model.ts` (eligibility, three seeded offers leaders-first, `lockIncidents` FIFO to capacity with family/deny rules and rank order, carry-forward and lapse). `RunState` gained `attack`, `attackEarnedAtGate`, `lastClose {gate, band, cleared}`, `incidents`, `incidentSurvivalKb`; `closeWindow` writes them and pays `INCIDENT_SURVIVAL_KB = 32` per incident on a clear; `fire-audit` is a new prep-only action.
- **Storage.** `audit_incidents` table + status enum, guarded migration `20260922120000_add_audit_incidents.sql`, `incident.repository.ts`.
- **Settlement.** `applyActionToRun` gained a `settle` seam between reducer and persist; `settleIncidents` locks the gate in front on every clear, marks survived/failed/lapsed, and is the one writer of a gate's audits. Abandon paths end a run's incidents.
- **Firing.** `getAttackTargets`, `fireAudit` (zod-validated; the server re-deals the offers and refuses a stale pair), `getIncidentsFeed`; hooks `useAttackTargets`, `useFireAudit`, `useIncidentsFeed`.
- **Surfaces (kanto).** `AttackPanel.ui` on prep with empty states, `IncidentsScreen.ui` at `/run/incidents` (own rows ringed), `Audit.ui` names its sender, the gate outcome itemises `audits survived` and chips `attack earned`, prep footer and the terminal community footer link to Incidents. Stories and specs for both new kit pieces.
- **Fallout absorbed.** Prep read `DEFAULT_AUDIT_SCHEDULE` instead of the run's schedule (fixed via `PrepFrame.audits`); the Dex lost its certain-audit column and its always-zero tally (`GatedexEntry.auditCapacity`, `auditdex(gates)`); `upcomingAuditFor` deleted; `localDayRange` moved to `~/shared/lib/dateUtils`.
- **Docs.** ADR-099; ADR-056 D1/D2/D4 and ADR-038 D2 collapsed to pointers; ADR-035 D4 narrowed; README index; rejected.md; wiki §2.3, §2.8, §7.4, glossary; CONTEXT.md incident rows and the stale community row; CHANGELOG.

Verification 2026-09-22: 4053 tests passing. The 8 failures in the full suite are the pre-existing ADR-097 version-odds work (`draft.model`, `shopScreen.viewmodel`, `dexScreen.viewmodel`, `Registry`), untouched here. depcruise clean, tsc clean.

Deferred, for follow-up beans: standouts *most wanted* / *survived the stack* and the run-over faced/survived line (after DVTD-j6t1); DVTD-gvc9 can now read a true tally from `audit_incidents`; band-aware capacity; the kanto community screen's incidents link (DVTD-6poh).


## Simulator (added on request, 2026-09-22)

`/proto-run` now wires the panel with a simulated field (Misty, Brock, Erika eligible around your gate; Koga behind and Sabrina thin are filtered by the real `eligibleRivals`), fires through the real reducer, and lists what you filed on a simulated Incidents screen. Verified in the browser: unarmed panel on prep, `attack earned` chip after a PERFECT clear, two payloads per rival, fire spends the credit, the log shows `You → Brock · 502 Bad Gateway · gate 3 · Thunder · queued`.
