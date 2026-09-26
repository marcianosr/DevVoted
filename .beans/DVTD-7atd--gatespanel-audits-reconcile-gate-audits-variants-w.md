---
# DVTD-7atd
title: 'GatesPanel audits: reconcile GATE_AUDITS variants with audits.ts''s collapsed roster'
status: todo
type: task
created_at: 2026-08-23T19:19:23Z
updated_at: 2026-08-23T19:19:23Z
---

`GatesPanel`'s `DexGate.audits` is `readonly string[]` of display labels
("Cost Overrun"), the one surface in modern-theme that does not pass `AuditId`
and read `AUDIT[id].label` from `audits.ts`. So the gate-to-audit mapping is
stated twice with nothing tying the two together, and `EXTRAS` in
GatesPanel.stories.tsx has to spell the names out.

Blocked on a decision, not on code: `GATE_AUDITS` emits `timeout-3/4/5` and
`strip-1/2` because the numbers differ per gate, while `audits.ts` collapses each
to the one entry a player sees. Reading the roster directly needs a rule for that
collapse.

- [ ] Decide how per-gate audit variants map to the player-facing entry
- [ ] DexGate.audits becomes readonly AuditId[]
- [ ] GatesPanel.stories reads GATE_AUDITS instead of hand-written labels
