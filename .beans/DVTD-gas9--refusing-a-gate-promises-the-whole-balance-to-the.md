---
# DVTD-gas9
title: Refusing a gate promises the whole balance to the archive
status: todo
type: bug
priority: high
created_at: 2026-10-01T14:53:22Z
updated_at: 2026-10-01T14:53:22Z
parent: DVTD-lk20
---

**What:** The refuse-the-gate option says it archives your whole storage balance, but a refused gate banks only the share a death at that gate would bank.

**Why:** It is the one exit offered to a player who cannot pay the peel, and it overstates its reward by a factor of six at gate 2.

## Done when
- [ ] The refusal states the KB that will actually reach the archive
- [ ] Refusing at gate 2 with 442 KB states and banks the same figure (about 68 KB)
- [ ] A test pins the stated figure to the banked one

## Notes
Seen: "End the run here … Banks gate 2 of 13 and archives +442 KB." Wiki §2.6: refusing banks gatesCleared ÷ 13 of leftover storage.
Cause: gateOutcome.viewmodel.ts:807 prints signedKbLabel(balanceKb); the reducer banks via storageCreditRate("dead", gatesCleared) = min(1, gatesCleared / GATE_COUNT) in rules.model.ts. Quote bankedKb instead.
Repro: proto-run, answer 1 of 5 right at Cascade (gate 2), read the hold screen.
