---
# DVTD-xl63
title: Decide the gate-level correctness floor on its own terms
status: todo
type: task
priority: high
created_at: 2026-09-14T13:49:37Z
updated_at: 2026-09-14T13:49:37Z
---

`gateClosingFor` (gate.model.ts) carries a TODO proposing that a run answering
fewer than `FLOOR_CORRECT` of five holds the gate whatever its run score says.
`FLOOR_CORRECT = 2`, `meetsGateFloor` and `clearsGateFloor` all ship already, and
two specs in `gate.model.spec.ts` are red waiting for it.

`docs/adr/rejected.md` rejects exactly this under "A gate-level correctness
floor". The reasoning there is dead — it argued "get one right already existed as
Unit Tests' check", and ADR-035 deleted config checks — so the rejection deserves
re-litigating rather than quietly overriding.

It also changes prep: the clear row would gain a second condition and its cost
figure becomes `max(FLOOR_CORRECT, owed)`. Left out of DVTD-xj95 on purpose so
the screen never states a rule the engine does not enforce.

## Todo

- [ ] Decide it, and either amend rejected.md or delete the TODO
- [ ] If it lands: wire `gateClosingFor`, green the two specs
- [ ] If it lands: the clear objective states both conditions
