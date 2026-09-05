---
# DVTD-qfi1
title: Audits are drawn from pools, not scheduled per gate
status: completed
type: feature
priority: high
created_at: 2026-09-04T12:53:04Z
updated_at: 2026-09-04T13:25:46Z
---

Replace the hand-written GATE_AUDITS table with a seeded draw. The escalation
curve is unchanged (1 audit from gate 3, 2 from 8, 3 from 11 — ADR-038); what
changes is which audits land at gates 4-11.

Seed is the **date**, so everyone climbing today faces the same gauntlet
(matches the shared daily poll sequence, ADR-009). Gate 3 keeps its fixed
introduction (402), gate 12 keeps its handcrafted Champion three, gate 11 keeps
410 Gone pinned plus two drawn.

Compatibility is a data rule: every audit carries a family and a gate never
draws two from the same family. One deny pair on top: 300 Multiple Choices never
draws with 408 Request Timeout.

Uniqueness is band-local for now. Run-wide uniqueness needs a bigger roster —
12 drawn slots against 13 drawable audits would put 12 of 13 in every run and
strand gate 11, whose pool has one exclusive member. Step 2 authors ~6 audits
then flips UNIQUE_WITHIN from "band" to "run".

Plan: ~/.claude-work/plans/recommended-structure-gate-3-zazzy-castle.md

- [x] Canonical audit ids: timeout/strip dials become functions of gate
- [x] AUDIT_ROSTER registry + auditAt(id, gate)
- [x] auditSchedule.model.ts: families, pools, deny pairs, rank, drawAuditSchedule
- [x] RunState.auditSchedule + auditsOf fallback + createRun/startRunService
- [x] Thread the schedule through gate.model, answer.model, viewmodels, snapshot, repository
- [x] Dex Gates/Audits tabs show band pools
- [x] Specs: seed-swept invariants, stranding guard, pool-size assertions
- [x] ADR-056 + inline markers on ADR-038 D2 and ADR-035 D4 + README row
- [x] Wiki 2.3/2.8/9/10; boyscout gate-10 Deprecated->Breaking Change, Elite 40->45%
- [x] CHANGELOG Changed entry

## Summary of Changes

**Domain.** `GATE_AUDITS` is gone. `audit.model.ts` now exports `AuditId` (15
canonical ids), an `AUDIT_ROSTER` of `(gate) => Audit` builders, `auditAt(id, gate)`
and `AuditSchedule`. The two parameterised audits take their dial from the gate
instead of the id: `timeout` runs 3 polls at 30s below gate 10, 3 at 25s at 10-11,
5 at 20s at 12; `strip` adds +0.10 at 11 and +0.15 at 12.

New `auditSchedule.model.ts` owns the draw: seven families, one deny pair
(300 never with 408), three pools, a roster rank for in-gate order, and
`drawAuditSchedule(seed)`. It fills gate by gate from a shrinking pool, so
uniqueness falls out rather than being checked. `UNIQUE_WITHIN` is the one
constant that turns band-local uniqueness into run-wide.

**State.** `RunState.auditSchedule` stores drawn ids; `RunSnapshot` is serialized
whole so no migration. `scheduleOf(state)` is the only `??` fallback and
`auditsOf(state)` the only funnel. `startRunService` passes
`drawAuditSchedule(date)`, so the gauntlet is shared per day.

**Two design corrections found by building it.** 409 Conflict and 426 Upgrade
Required moved out of pool A: both pick by config level, and at gate 4 nothing is
upgraded, so they roll among ties while their copy claims to punish a favourite.
And 402 came out of pool A after a printed draw showed it at gate 3 *and* gate 5;
the first five audited gates now always teach five distinct rules.

**Dex.** The Gates tab names what a gate is certain to carry and states the rest
as `draws N of M` (a count, since pool B's 13 rules across 3 rows would bury the
ladder's figures). The Audits tab is one row per id with every gate it can reach.
`runsFaced`/`runsBeaten` now count only certain gates, so a drawn audit reports 0
and the panel prints no record rather than a tally nothing recorded (DVTD-gvc9).

**Also fixed while in there.** ADR-038's "Deprecated" -> "Breaking Change"
(closes DVTD-oa0j); the wiki's Elite peel 40% -> 45% (the code computes 0.35+0.10);
ADR-038's odd-gate rule for Read-only dropped, its premise (gate-staged rungs,
ADR-030) having been deleted by ADR-046. `GatesPanel.stories.tsx` was already
broken on three dead symbols (`GATE_AUDITS`, `failStripsFor`, `stripQuotaOnFail`)
and now reads off the real roster. `toAuditId`'s suffix regex is dead and gone.

**Verification.** 2716 tests / 208 files pass, oxlint + dependency-cruiser + tsc +
build all clean. The 3 remaining failures are in
`src/ui/modern-theme/screens/RewardScreen.spec.tsx` and are unchanged from the
pre-existing baseline. Story typecheck (via a scratchpad tsconfig clearing the
exclusion) shows 27 pre-existing errors in 7 files I did not touch. Uncommitted.

**Left to tune:** pool A at six rules over four gates is the thin end
(15 distinct sets). Whether 507's 16/32KB leak is survivable as early as gate 4
is the first thing a playtest should answer.

## Follow-up

Step 2 (author ~6 audits, then flip `UNIQUE_WITHIN` to `"run"`) is not raised as a
bean yet.
