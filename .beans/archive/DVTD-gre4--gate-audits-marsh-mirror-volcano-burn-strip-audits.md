---
# DVTD-gre4
title: 'Gate audits: Marsh mirror, Volcano burn, strip audits'
status: completed
type: feature
priority: normal
created_at: 2026-08-17T09:51:44Z
updated_at: 2026-08-17T11:10:29Z
parent: DVTD-kulw
blocked_by:
    - DVTD-zjeq
---

Phase B of ADR-035. New gate/domain/audit.model.ts: fixed thematic per-gate rules. Marsh (gate 7) mirrors scoring (wrong answers earn, correct bleeds; demandFactor prices the lost streaks). Volcano (gate 9) burns KB per poll, more when wrong (floors at 0; insolvency stays non-lethal per ADR-023). Elite (11) and Champion (12) carry strip audits - the ONLY strip trigger left; stake-fatal death returns there via the dormant Phase A plumbing. Volkswagen CI re-enters as the audit suppressor (suppresses the gate's first audit, struck-through on the receipt). Gates 0-6/8/10 ship clean. Audit section on GateStakeReceipt; persistent cue banner on AnsweringScreen; inverted verdict under Marsh.

## Summary of Changes

Shipped 2026-08-17 alongside Phase A (ADR-035).

- `gate/domain/audit.model.ts`: Audit type (scoreShare / burnKb / stripQuotaOnFail / demandFactor), GATE_AUDITS roster (7 Mirror, 9 Burn, 11 Strip-2, 12 Burn+Strip-3), liveAuditsFor/suppressedAuditFor for Volkswagen suppression, fold helpers.
- Reducer: audits fold the raw share before multipliers (mirror inverts earn AND bleed for free; streak + faucet stay on true correctness); burn taxes per poll, floored at 0, never lethal; a strip-audit fail wakes the dormant strip -> shop -> prep plumbing, and a quota >= build is death (the only gate-death left).
- gatePassed reads gateDemandFor = table row x live demandFactor. Mirror factor tuned to 0.5 during the summit sim: 0.7 left Marsh unclearable without a x2.45 build, since mirrored answers forfeit streaks (base pace 5x(g+1) flat).
- Volkswagen CI re-entered the roster as the audit suppressor (Config.suppressesAudit); suppressing the Mirror also removes its demand discount.
- UI: Audit section on GateStakeReceipt + GateStakeRewards (struck-through 'reported passing' when suppressed), persistent cue banner on AnsweringScreen (DVTD-5o4d's requirement); score chips invert automatically at the mirror (isCorrect derives from the breakdown sign). Stories: PrepScreen MarshAudit/ChampionSuppressed, AnsweringScreen MirroredGate.
- Verified: 1511 tests green, oxlint + depcruise clean, build + tsc clean.

Follow-up left open: PollOutcomeBar keeps true-correctness colors at the mirror (the cue + inverted chips carry the message) — revisit after a live Marsh playtest.
