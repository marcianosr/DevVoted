---
# DVTD-x0uf
title: Clean gates foreshadow the first audit on the receipt
status: completed
type: feature
priority: normal
created_at: 2026-08-26T16:22:44Z
updated_at: 2026-08-26T16:28:34Z
---

Gates 0–2 run clean, so the receipt's Audit section simply vanishes — new players never learn audits exist until gate 3 charges them Cost Overrun. The audit system's first impression is a punishment.

Fix: a clean gate's receipt keeps the Audit section and foreshadows instead: "None scheduled — the first audit runs at gate 3: Cost Overrun — …". Teaches the receipt-reading habit while it is still free; the section never goes silent.

- [x] Domain: `nextAuditedGateFrom` in audit.model.ts
- [x] Viewmodel: `upcomingAuditFor` + optional `upcomingAudit` on GateStake
- [x] UI: shared Audit section in GateStakeReceipt.ui.tsx (receipt + rewards preview), muted note, no saffron — it is not this gate's warning
- [x] Specs: domain + viewmodel + receipt rendering
- [x] Wiki §2.3 sentence, CHANGELOG entry

## Summary of Changes

A clean gate's receipt keeps its Audit section and foreshadows: "None scheduled. The first audit waits at gate 3: Cost Overrun — Every paid action costs ×2 — linting and peeking both."

- `nextAuditedGateFrom` (audit.model.ts): first audited gate at or beyond a gate, with its leading audit.
- `upcomingAuditFor` + `UpcomingAuditView` (gateStake.viewmodel.ts): set only when the gate itself runs clean; wired into the one `gateStake` builder in runView.viewmodel.ts, so GateStakeReceipt and the reward screen's "Next up" preview both get it for free.
- GateStakeReceipt.ui.tsx: both audit blocks extracted into a shared `AuditSection` that renders the rows or the muted `UpcomingAuditNote` — muted, not saffron, because it is not this gate's warning.
- Specs: 3 domain (incl. past-the-last-gate), 2 viewmodel, new GateStakeReceipt.spec.tsx (foreshadow shown / suppressed by real audits / section dropped with nothing ahead), 1 runView wiring test. The gate-4 strict `toEqual` still passes: `upcomingAudit` is undefined at audited gates.
- Wiki §2.3 sentence + CHANGELOG Unreleased entry.

Verified: targeted specs 103 passed; full suite 2422 passed with 3 pre-existing failures in modern-theme RewardScreen.spec.tsx (untouched, failing before this change); `npx tsc --noEmit` clean; `npm run lint` clean (770 modules, no violations).
