---
# DVTD-q1s7
title: A gate's audits resolve once
status: todo
type: task
priority: normal
created_at: 2026-09-25T19:45:51Z
updated_at: 2026-09-25T19:45:51Z
parent: DVTD-y3vn
---

**What:** The audits live on a gate resolve to one effects object that the engine and the screens read fields off.

**Why:** Twelve one-line folds each with a single caller mean a new audit flag needs a roster field, a new export and an import, and the audit model's interface is as wide as its data.

## Done when
- [ ] One function resolves a gate's audits into an effects object, tested for none, one and two audits folding the same field
- [ ] The twelve per-field folds are gone and every caller reads the object
- [ ] The effects are derived on read, never stored on the run
- [ ] The dormant demand factor keeps its plumbing

## Notes
Plan section "Slice 6" (6b). `AuditEffects` / `auditEffectsFor` in `audit.model.ts`; `auditEffectsOf(state)` lens in `run.model.ts`; `gate.model.ts` resolves once per function. Scalars fold min/product/sum/OR; `scoreShare`, `burnKb`, `timeLimitMs` stay functions on the object. Delete `AUDIT_ROSTER_SIZE`. Callers: answer, paidAction, runAction, runView, runSnapshot, objectiveProgress, run.repository, gateStake. DVTD-pshl unchanged.
